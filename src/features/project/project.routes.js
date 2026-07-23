import { Router } from 'express';
import * as projectController from './project.controller.js';
import { createProjectValidation, updateProjectValidation } from './project.validation.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post('/', createProjectValidation, validate, projectController.createProject);
router.post('/list', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.patch('/:id', updateProjectValidation, validate, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
