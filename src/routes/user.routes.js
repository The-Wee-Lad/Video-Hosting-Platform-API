import { Router } from "express";
import { registerUser, 
        loginUser, 
        refreshAccessToken, 
        logout, 
        changePassword, 
        getCurrentUser, 
        updateAccountDetails,
        updateAvatar,
        updateCoverImage} from "../controllers/user.controllers.js";
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

//Secured Routes
router.route("/login").post(upload.none(),loginUser);
router.route("/refresh-accessToken").post(refreshAccessToken);
router.route("/logout").post(upload.none(), verifyJwt, logout)
router.route("/change-pass").post(upload.none(), verifyJwt, changePassword)
router.route("/getcurruser").get(verifyJwt, getCurrentUser)
router.route("/update-acc-details").patch(upload.none(),verifyJwt, updateAccountDetails);
router.route("/update-avatar").post(upload.single("avatar"),verifyJwt ,updateAvatar);
router.route("/update-cover").post(upload.single("coverImage"),verifyJwt ,updateCoverImage);
export default router;