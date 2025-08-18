import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from "./route.js"
import cors from 'cors';


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;




const connectDB = async () => {
    try {
        mongoose.connect(mongoURI as string,{
            dbName: "MusicAPP"
        }).then(() => console.log("MongoDB connected successfully"))
    }
    catch (error) {
        console.error("MongoDB connection error:", error);

    }
}


app.use("/api/v1", userRoutes);

app.listen(port, () => {
  console.log(`User Service is running on port ${port}`);
  connectDB();
});