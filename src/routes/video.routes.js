import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload, uploadVideos} from "../middlewares/multer.middleware.js"
import { publishVid,
        togglePublish,
        getAllVideos,
        getVideoById,
        deleteVideo,
        updateVideo,
        toggleComments
    } from "../controllers/video.controller.js ";

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
.patch(upload.none(),updateVideo)
.delete(deleteVideo);

router.route("/toggle-publish/:videoId")
.post(togglePublish);

router.route("/toggle-comments/:videoId")
.post(toggleComments);

export default router;