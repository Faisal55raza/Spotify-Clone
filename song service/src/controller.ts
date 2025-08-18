import TryCatch from "./tryCatch.js";
import type { Request, Response } from "express";
import { redisClient } from './index.js'
import { sql } from './config/db.js'



export const getAllAlbums = TryCatch(async (req: Request, res: Response) => {
    let albums
    const CACHE_EXPIRY = 1800;

    if (redisClient.isReady) {
        albums = await redisClient.get('albums');
        if (albums) {
            console.log("Cache hit for albums");
            albums = JSON.parse(albums);
        } 
        else {
            albums = await sql`SELECT * FROM albums`;
            await redisClient.set('albums', JSON.stringify(albums),
                {
                    EX: CACHE_EXPIRY
                })
        }
    } else {
        albums = await sql`SELECT * FROM albums`;
        
    }
      res.status(200).json({
            message: "All Albums returned successfully",
            data: {
                albums
            }
    });
});

export const getAllSongs = TryCatch(async (req: Request, res: Response) => {
    let songs
    const CACHE_EXPIRY = 1800;

    if(redisClient.isReady){
        songs = await redisClient.get('songs');
        if(songs){
            console.log("Cache hit for songs");
            songs = JSON.parse(songs);
        }
        else{
            songs = await sql`SELECT * FROM songs`;
            await redisClient.set('songs', JSON.stringify(songs),
                {
                    EX: CACHE_EXPIRY
                })
        }
    }
    else{
        songs = await sql`SELECT * FROM songs`;
    }

    res.status(200).json({
        message: "All Songs returned successfully",
        data: {
            songs
        }
    });
});

export const getAllSongsByAlbum = TryCatch(async (req: Request, res: Response) => {
    let songs, Album

    const albumId = req.params.album_id;

    Album = await sql`SELECT * FROM albums WHERE id = ${albumId}`;
    if (Album.length == 0) {
        return res.status(404).json({
            message: "Album not found"
        });
    }
    if (redisClient.isReady) {
        songs = await redisClient.get(`songs:album:${albumId}`);
        if (songs) {
            console.log("Cache hit for songs by album");
            songs = JSON.parse(songs);
        } else {
            songs = await sql`SELECT * FROM songs WHERE album_id = ${albumId}`;
            await redisClient.set(`songs:album:${albumId}`, JSON.stringify(songs), {
                EX: 1800
            });
        }
    } else {
        songs = await sql`SELECT * FROM songs WHERE album_id = ${albumId}`;
    }

    res.status(200).json({
        message: "All Songs by album returned successfully",
        data: {
            songs,
            album: Album[0]
        }
    });
});

export const getSingleSong = TryCatch(async (req: Request, res: Response) => {
    let song

    const songId = req.params.song_id;
    song = await sql`SELECT * FROM songs WHERE id = ${songId}`;
    if (song.length == 0) {
        return res.status(404).json({
            status: "fail",
            message: "Song not found"
        });
    }

    res.status(200).json({
        message: "Song returned successfully",
        data: {
            song: song[0]
        }
    });
});
