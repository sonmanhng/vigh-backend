import { Router } from 'express';
import {
  addLaborLog,
  getMyLaborLogs,
  deleteLaborLog,
  getMyLaborStats,
  getAdminLaborStats
} from '../controllers/labor.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// User endpoints
router.post('/', addLaborLog);
router.get('/my-logs', getMyLaborLogs);
router.delete('/:id', deleteLaborLog);
router.get('/my-statistics', getMyLaborStats);

// Admin endpoints
router.get('/admin-statistics', getAdminLaborStats);

export default router;
