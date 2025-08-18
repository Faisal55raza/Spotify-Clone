import express from 'express'
import dotenv from 'dotenv';
import redis from 'redis'
import songRoutes from './route.js';
import cors from 'cors'

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());

export const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!)
    }
});

redisClient.connect().then(()=> console.log("Redis connected successfully")).catch(err => console.log("Redis connection failed", err));
const port = process.env.PORT

app.use('/api/v1',songRoutes);

app.listen(port, () => {
    console.log(`Song Service is running on port ${port}`);
});