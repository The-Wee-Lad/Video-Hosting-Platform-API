import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
        getVideoComments,
        addComment,
        deleteComment,
        updateComment
        } from "../controllers/comment.controller.js"

const router = Router();

router.use(verifyJwt);
router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;