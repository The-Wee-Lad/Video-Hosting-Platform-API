import multer from "multer";
import path from "path";
import { publicDir } from "../constants.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDir)
    },
    filename: function (req, file, cb) {  
        let fileName = "" + Date.now() + file.filename;
        console.log("In Multer... ");
        cb(null, fileName);
        console.log("Exit Multer...");
    }
});

const upload = multer({ 
    storage,
});

const uploadVideos = multer({
    storage,
    fileFilter: function(req, file, callback){
        let ext = path.extname(file.originalname);
        if(! ['.mp4', '.mov', '.mpeg4', '.avi', '.gif'].includes(ext)){
            return callback(new ApiError(400,"Nothing But Videos are allowed"));
        }
        callback(null, true);
    },
    limits: {
        fileSize: 1024*1024
    }
});


export { upload, uploadVideos };