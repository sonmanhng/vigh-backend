import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller';
import { createResearchContent, updateResearchContent, deleteResearchContent } from '../controllers/researchContent.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createProject);
router.put('/:id', updateProject);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteProject);

// Research Content sub-cards routes
router.post('/:projectId/research-contents', createResearchContent);
router.put('/:projectId/research-contents/:contentId', updateResearchContent);
router.delete('/:projectId/research-contents/:contentId', deleteResearchContent);

export default router;
