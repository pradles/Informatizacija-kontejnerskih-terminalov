import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import roleRoute from './routes/role.js';
import authRoute from './routes/auth.js';
import userRoute from './routes/user.js';
import terminalRoute from './routes/terminal.js';
import containerRoute from './routes/container.js';
import storageRoute from './routes/storage.js';
import ownerRoute from './routes/owner.js'
import { CreateError } from './utils/error.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))
app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/terminal", terminalRoute);
app.use("/api/container", containerRoute);
app.use("/api/storage", storageRoute);
app.use("/api/owner", ownerRoute);


// Response handler middleware
app.use((obj, req, res, next)=>{
    const statusCode = obj.status || 500;
    const message = obj.message || "Internal server error.";
    return res.status(statusCode).json({
        success: [200,201,204].some(a=> a === obj.status) ? true : false,
        status: statusCode,
        message: message,
        data: obj.data,
        stack: obj.stack,
    });
})




//DB connection
const connectMongoDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");
    } catch (error) {
        return next(CreateError(500, "Could not connect to DB."));
    }
}


app.listen(3000, ()=>{
    connectMongoDB();
    console.log("Server running!")
})

// const uri = "mongodb+srv://jernejivancic:lolnoob2002@informatizacija.fq1tdz6.mongodb.net/?retryWrites=true&w=majority&appName=informatizacija";
