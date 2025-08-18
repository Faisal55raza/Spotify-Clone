import TryCatch from "./tryCatch.js";
import type { AuthenticatedRequest } from "./middleware.js";
import type { Response, Request } from "express";
import getBuffer from "./config/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";

export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response) => {

    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access Denied, Only Admins Can Add Albums" });
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "File is required" });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({ message: "Failed to generate file buffer" });
    }


    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "albums"
    });
    if (!cloud || !cloud.secure_url) {
        return res.status(500).json({ message: "Failed to upload file to cloud" });
    }

    const result = await sql`INSERT INTO albums (title, description, thumbnail) VALUES (${title}, ${description}, ${cloud.secure_url}) RETURNING *`;

    if(redisClient.isReady){
        await redisClient.del('albums');
        console.log("Cache cleared for albums");
    }

    return res.status(201).json({
        message: "Album Added Successfully",
        album: result[0]
    });
});

export const addSong = TryCatch(async (req: AuthenticatedRequest, res: Response) => {

  if(req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access Denied, Only Admins Can Add Songs" });
  }

  const { title, description, album_id } = req.body;

  const isAlbumExists = await sql`SELECT * FROM albums WHERE id = ${album_id}`;
  if (isAlbumExists.length === 0) {
    return res.status(404).json({ message: "Album not found" });
  }
  const file = req.file;

    const fileBuffer = getBuffer(file);

    if(!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({ message: "Failed to generate file buffer" });
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "songs",
        resource_type: "video" // Assuming audio files are uploaded as video type
    });
    if (!cloud || !cloud.secure_url) {
        return res.status(500).json({ message: "Failed to upload file to cloud" });
    }

    const result = await sql`INSERT INTO songs (title, description, album_id, audio) VALUES (${title}, ${description}, ${album_id}, ${cloud.secure_url}) RETURNING *`;
    
    if(redisClient.isReady){
        await redisClient.del('songs');
        await redisClient.del(`songs:album:${album_id}`);
        console.log("Cache cleared for songs");

    }
    else {
        res.status(500).json({ message: "Redis is not connected, unable to clear cache" });
    }
    return res.status(201).json({
        message: "Song Added Successfully",
        song: result[0]
    });
});

export const addThumbnail = TryCatch(async(req:AuthenticatedRequest, res:Response) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access Denied, Only Admins Can Add Thumbnails" });
    }

    const song_id = req.params.song_id;

    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "File is required" });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({ message: "Failed to generate file buffer" });
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "thumbnails"
    });
    if (!cloud || !cloud.secure_url) {
        return res.status(500).json({ message: "Failed to upload file to cloud" });
    }
    const song = await sql`SELECT * FROM songs WHERE id = ${song_id}`;
    if (song.length === 0) {
        return res.status(404).json({ message: "Song not found" });
    }
    const result = await sql`UPDATE songs SET thumbnail = ${cloud.secure_url} WHERE id = ${song_id} RETURNING *`;
    if (redisClient.isReady) {
        await redisClient.del(`songs`);
        await redisClient.del(`songs:album:${song[0]!.album_id}`);
        console.log("Cache cleared for songs by album");
    }
    return res.status(200).json({
        message: "Thumbnail Added Successfully",
        song: result[0]
    });
});
export const deleteAlbum = TryCatch(async(req:AuthenticatedRequest, res:Response) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access Denied, Only Admins Can Delete Albums" });
    }
    const album_id = req.params.album_id;

    const album = await sql`SELECT * FROM albums WHERE id = ${album_id}`;
    if (album.length === 0) {
        return res.status(404).json({ message: "Album not found" });
    }
    const songs = await sql`DELETE FROM songs WHERE album_id = ${album_id}`;

    songs.forEach(async (song) => {
        if (song.thumbnail) {
            await cloudinary.v2.uploader.destroy(song.thumbnail);
        }
    });

    const result = await sql`DELETE FROM albums WHERE id = ${album_id} RETURNING *`;
    if (redisClient.isReady) {
        await redisClient.del('albums');
        await redisClient.del(`songs`);
        await redisClient.del(`songs:album:${album_id}`);
        console.log("Cache cleared for albums");
    }

    return res.status(200).json({
        message: "Album Deleted Successfully",
        album: result[0]
    });
});


export const deleteThumbnail = TryCatch(async(req:AuthenticatedRequest, res:Response) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access Denied, Only Admins Can Delete Thumbnails" });
    }

    const song_id = req.params.song_id;

    const song = await sql`SELECT * FROM songs WHERE id = ${song_id}`;
    if (song.length === 0) {
        return res.status(404).json({ message: "Song not found" });
    }
    const existingThumbnail = song[0]!.thumbnail;

    if (existingThumbnail) {
        await cloudinary.v2.uploader.destroy(existingThumbnail);
    }

    const result = await sql`UPDATE songs SET thumbnail = NULL WHERE id = ${song_id} RETURNING *`;
     if (redisClient.isReady) {
        await redisClient.del(`songs`);
        await redisClient.del(`songs:album:${song[0]!.album_id}`);
        console.log("Cache cleared for songs by album");
    }
    return res.status(200).json({
        message: "Thumbnail Deleted Successfully",
        song: result[0]
    });
});

export const deleteSong = TryCatch(async(req:AuthenticatedRequest, res:Response) => {
    if(req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access Denied, Only Admins Can Delete Songs" });
    }

    const song_id = req.params.song_id;

    const song = await sql`SELECT * FROM songs WHERE id = ${song_id}`;
    if (song.length === 0) {
        return res.status(404).json({ message: "Song not found" });
    }

    const existingThumbnail = song[0]!.thumbnail;

    if (existingThumbnail) {
        await cloudinary.v2.uploader.destroy(existingThumbnail);
    }

    const result = await sql`DELETE FROM songs WHERE id = ${song_id} RETURNING *`;

    if (redisClient.isReady) {
        await redisClient.del(`songs`);
        await redisClient.del(`songs:album:${result[0]!.album_id}`);
        console.log("Cache cleared for songs by album");
    }

    return res.status(200).json({
        message: "Song Deleted Successfully",
        song: result[0]
    });
});
