import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from "./route.js"



dotenv.config();


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
const app = express();
app.use(express.json());

app.use("/api/v1", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});