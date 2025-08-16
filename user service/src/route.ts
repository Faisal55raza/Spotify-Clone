import express from 'express';
import { loginUser, registerUser, getUserDetails } from './controller.js';
import { authenticate } from './middleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/my-detail',  authenticate as unknown as express.RequestHandler, getUserDetails);

export default router;