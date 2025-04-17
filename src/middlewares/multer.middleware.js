import multer from "multer";
import path from "path";
import { publicDir } from "../constants.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicDir)
    },
    filename: function (req, file, cb) {
        let fileName = "" + Date.now() + file.originalname;
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
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        // console.log("Extension : ", ext);
        if (file.fieldname == "videoFile" && !['.mp4', '.mov', '.mpeg4', '.avi', '.gif'].includes(ext)) {
            return callback(new ApiError(400, "Nothing But Videos are allowed"));
        }
        if (file.fieldname == "thumbnail" && !['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg']
            .includes(ext)) {
            return callback(new ApiError(400, "Nothing But Images in thumbnails are allowed"));
        }
        callback(null, true);
    },
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});


export { upload, uploadVideos };