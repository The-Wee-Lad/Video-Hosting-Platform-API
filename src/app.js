import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true, limit : "16kb"}));
app.use(express.static('../public'));
app.use(cookieParser());

import  userRouter from "./routes/user.routes.js";
import subsRouter from "./routes/subscription.routes.js";
import healthRouter from "./routes/healthcheck.routes.js";
import vidsRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
app.use("/user",userRouter);
app.use("/subs",subsRouter)
app.use("/vid",vidsRouter);
app.use("/healthcheck",healthRouter);
app.use("/comment",commentRouter);
app.use('/like',likeRouter);


export { app };