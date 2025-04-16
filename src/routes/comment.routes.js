import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
        getVideoComments,
        addComment,
        deleteComment,
        updateComment,
        } from "../controllers/comment.controller.js"

const router = Router();

router.use(verifyJwt);
router.route("/:videoId").get(getVideoComments).post(upload.none(),addComment);
router.route("/c/:commentId").delete(deleteComment).patch(upload.none(),updateComment);

export default router;