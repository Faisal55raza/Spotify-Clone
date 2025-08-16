import type { Request, Response } from 'express';
import TryCatch from './tryCatch.js'; 
import {User} from './model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { AuthenticatedRequest } from './middleware.js';
dotenv.config();

export const registerUser = TryCatch(async( req:Request, res:Response ) => {
    const { username, password, email } = req.body;

    let user = await User.findOne({ email });
    if (user){
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt
        .hash(password, process.env.SALT ? parseInt(process.env.SALT) : 10);

    user = await User.create({ name: username, password: hashedPassword, email });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    // Only return safe user fields
    const safeUser = { _id: user._id, name: user.name, email: user.email };

    res.status(201).json({ message: "User registered successfully", user: safeUser, token });
});

export const loginUser = TryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    // Only return safe user fields
    const safeUser = { _id: user._id, name: user.name, email: user.email };

    res.status(200).json({ message: "User Logged In", user: safeUser, token });
});

export const getUserDetails = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({success: true, user });

});
