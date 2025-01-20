import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload, uploadVideos} from "../middlewares/multer.middlewares.js"
import { publishVid, tooglePublish, getAllVideos, getVideoById, deleteVideo, updateVideo } from "../controllers/video.controllers.js";

const router = Router();

router.use(verifyJwt);

router.route("/")
.post(uploadVideos.fields([
    {
        name: "videoFile",
        max:1,
    }]),upload.fields([
    {
        name: "thumbnail",
        max:1 
    }]), publishVid)
.get(getAllVideos);  

router.route("/:videoId")
.get(getVideoById)
.patch(updateVideo)
.delete(deleteVideo)

router.route("/toggle-publish/:videoId")
.post(tooglePublish)

export default router;