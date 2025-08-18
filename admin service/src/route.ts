import express from 'express';
import { addAlbum, addSong, addThumbnail, deleteAlbum, deleteSong, deleteThumbnail } from './controller.js';
import uploadFile, { isAuth } from './middleware.js';

const router = express.Router();

router.post('/album', isAuth as unknown as express.RequestHandler, uploadFile, addAlbum);
router.post('/song', isAuth as unknown as express.RequestHandler, uploadFile, addSong);
router.post('/thumbnail/:song_id', isAuth as unknown as express.RequestHandler, uploadFile, addThumbnail);
router.delete('/album/:album_id', isAuth as unknown as express.RequestHandler, deleteAlbum);
router.delete('/thumbnail/:song_id', isAuth as unknown as express.RequestHandler, deleteThumbnail);
router.delete('/song/:song_id', isAuth as unknown as express.RequestHandler, deleteSong);

export default router;