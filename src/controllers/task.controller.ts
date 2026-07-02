import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { isTopAdmin, isManagerOrAbove } from '../middlewares/auth.middleware';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.number().int(),
  assigneeId: z.number().int().optional(),
});

const updateTaskProgressSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  progress: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export const createTask = async (req: Request, res: Response) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!isManagerOrAbove(req.user!.role) && project.managerId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to create tasks for this project' });
    }

    const task = await prisma.task.create({
      data,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, email: true, role: true }
        }
      }
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
};

export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId as string);
    const tasks = await prisma.task.findMany({ 
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const data = updateTaskProgressSchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Authorization check: allow if TopAdmin OR Project Manager OR Task Assignee
    const isAuthorized = isTopAdmin(req.user!.role) || task.project.managerId === req.user!.id || task.assigneeId === req.user!.id;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Phân quyền phụ trong đề tài: chỉ SuperAdmin hoặc Chủ nhiệm đề tài mới được nghiệm thu (set DONE)
    if (data.status === 'DONE') {
      const canApprove = isTopAdmin(req.user!.role) || task.project.managerId === req.user!.id;
      if (!canApprove) {
        return res.status(403).json({ message: 'Chỉ Chủ nhiệm đề tài hoặc SuperAdmin mới có quyền nghiệm thu công việc này' });
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, email: true, role: true }
        }
      }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!isManagerOrAbove(req.user!.role) && task.project.managerId !== req.user!.id) {
       return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
