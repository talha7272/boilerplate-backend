import { Router } from 'express';
import * as userController from './user.controller.js';
import { registerValidation, loginValidation } from './user.validation.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';

const router = Router();

router.post('/register', registerValidation, validate, userController.register);
router.post('/login', loginValidation, validate, userController.login);
router.post('/logout', authenticate, userController.logout);
router.post('/refresh', userController.refresh);
router.get('/me', authenticate, userController.getProfile);

export default router;
