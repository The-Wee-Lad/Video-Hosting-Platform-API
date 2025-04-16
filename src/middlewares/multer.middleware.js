import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/public/temp')
    },
    filename: function (req, file, cb) {       
        cb(null, file.originalname+Date.now())
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