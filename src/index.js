// require('dotenv').config({path:'./.env'});

import connectDB from "../db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path:'./.env'
})
connectDB();




/*
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants";
// async function connectDB(){}

// connectDB();
import express from "express";
const app = express();



( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("Error",(error)=>{
            console.log("Err: ",error);
            throw error;
        });

        app.listen(process.env.PORT, ()=> {
            console.log(`Listening at : ${process.env.PORT}`);
        })
    } catch (error) {
        console.err("ERROR : ", error);
        throw error;
    }
})()

new Promise((resolveOuter) => {
    resolveOuter(
        new Promise((resolveInner) => {
            setTimeout(resolveInner, 1000);
        }),
    );
});
*/