import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
})

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

// console.log(process.env.CORS_ORIGIN);

connectDB()
.then(() => {
    app.listen(process.env.PORT||3000, ()=> {
        console.log(`Server is Listening at : ${process.env.PORT||3000}`);
    })
})
.catch((err) => {
    console.log("DB CONNECTION FAIL : ",err);
});