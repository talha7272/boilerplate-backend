import { Router } from 'express';
import userRoutes from '../features/user/user.routes.js';
import projectRoutes from '../features/project/project.routes.js';

const router = Router();

router.use('/auth', userRoutes);
router.use('/projects', projectRoutes);

export default router;
