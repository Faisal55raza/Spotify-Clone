import TryCatch from "./tryCatch.js";
import type { AuthenticatedRequest } from "./middleware.js";
import type { Response, Request } from "express";
import getBuffer from "./config/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "./config/db.js";

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

    return res.status(201).json({
        message: "Album Added Successfully",
        album: result[0]
    });
});