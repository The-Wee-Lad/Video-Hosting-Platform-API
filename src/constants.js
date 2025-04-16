export const DB_NAME = "youtubedb";
export const cookieOptions = {
    httpOnly: true,
    secured: true
}

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const publicDir = path.join(__dirname, "..", "public", "temp");


if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

console.log("publicDir:", publicDir);
console.log("Exists:", fs.existsSync(publicDir));

export const clearPublicDir = ([...filenames]) => {
    filenames.forEach(element => {
        if (fs.existsSync(path.join(publicDir, element))){
            fs.unlinkSync(path.join(publicDir, element));
            console.log("File Deleted : ", element);
        }
    });
}