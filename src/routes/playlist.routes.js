import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(upload.none(), createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(upload.none(),updatePlaylist)
    .delete(upload.none(),deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router