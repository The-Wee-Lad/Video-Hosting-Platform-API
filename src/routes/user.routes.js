import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logout } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const  router  = Router({mergeParams : true});


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1  
        }
    ]),
    registerUser
);

router.route("/login").post(upload.none(),loginUser);

router.route("/refresh-accessToken").post(refreshAccessToken);

router.route("/logout").post(upload.none(), verifyJwt, logout)

export default router;