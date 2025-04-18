import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})


console.log("CORS ORIGIN : ", process.env.CORS_ORIGIN);
const whitelist = [
    `null`,
    `http://localhost:4000/`,
    "https://your-production-site.com"
];

const app = express();
app.use(cors({
    origin: function (origin, callback) {
        console.log(origin,whitelist[0]);
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('../public'));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import subsRouter from "./routes/subscription.routes.js";
import healthRouter from "./routes/healthcheck.routes.js";
import vidsRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
app.use("/user", userRouter);
app.use("/subs", subsRouter)
app.use("/vid", vidsRouter);
app.use("/healthcheck", healthRouter);
app.use("/comment", commentRouter);
app.use('/like', likeRouter);
app.use('/playlist', playlistRouter)


export { app };