import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload, uploadVideos} from "../middlewares/multer.middlewares.js"
import { publishVid, tooglePublish } from "../controllers/video.controllers.js";

const router = Router();

router.use(verifyJwt);

router.route("/")
.post(uploadVideos.fields([
    {
        name: "videoFile",
        max:1,
    }
]),
upload.fields([
    {
        name: "thumbnail",
        max:1 
    }
]),
publishVid
);  

router.route("/:videoId")
.get()

router.route("/toggle-publish/:videoId")
.post(tooglePublish)

export default router;