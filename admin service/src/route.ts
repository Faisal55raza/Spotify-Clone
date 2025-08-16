import express from 'express';
import { addAlbum } from './controller.js';
import uploadFile, { isAuth } from './middleware.js';

const router = express.Router();

router.post('/add-album', isAuth as unknown as express.RequestHandler, uploadFile, addAlbum);

export default router;