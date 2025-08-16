import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import { User, type IUser } from './model.js';
dotenv.config();




export interface AuthenticatedRequest extends Request{
    user : IUser | null;
}

export const authenticate = async (req:AuthenticatedRequest, res:Response, next:NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(401).json({ message: "1-Please Login Again" });
        return;
    }
    try{
         const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;
    
         if(!decoded || !decoded._id) {
            res.status(401).json({ message: "2-Invalid Token" });
            return;
         }
         const userId = decoded._id;

         const user = await User.findById(userId).select('-password');
        
         if(!user) {
            res.status(403).json({ message: "3-User Not Found" });
            return;
         }
          req.user = user;
         }
         catch (error) {
          res.status(401).json({ message: `${error}` });
          return;
         }
          next();
         }