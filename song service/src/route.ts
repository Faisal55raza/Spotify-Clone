import express from 'express';
import { getAllAlbums, getAllSongs, getSingleSong, getAllSongsByAlbum } from './controller.js';


const router = express.Router();

router.get('/albums', getAllAlbums);
router.get('/songs', getAllSongs);
router.get('/songs/album/:album_id', getAllSongsByAlbum);
router.get('/song/:song_id', getSingleSong);

export default router;
