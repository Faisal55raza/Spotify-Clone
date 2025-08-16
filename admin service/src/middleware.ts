import type { Request, Response, NextFunction } from "express";
import axios from "axios";

interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}

export interface AuthenticatedRequest extends Request {
    user: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

        const token = req.headers.authorization?.split(' ')[1] as string;
        if(!token) {
            res.status(401).json({ message: "Please Login" });
            return;
        }

       const {data} = await axios.get(`${process.env.USER_URL}/api/v1/my-detail`, {
           headers: {
               authorization: `Bearer ${token}`
           }
       });
       req.user = data.user;
        next();
    }
    catch (error) {
        
        res.status(401).json({ message: "Please Login" });
        return;
    }
};

//multer
import multer from 'multer';

const storage = multer.memoryStorage();


const uploadFile = multer({ storage }).single('file');

export default uploadFile;

