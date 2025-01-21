import { Router } from "express";
import { registerUser, 
        loginUser, 
        refreshAccessToken, 
        logout, 
        changePassword, 
        getCurrentUser, 
        updateAccountDetails,
        updateAvatar,
        updateCoverImage,
        getUserChannelInfo,
        getWatchHistory,
        removeCoverImage,
        removeAvatar,
        removeUser,
    toggleSubscriptionPrivacy} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

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

//verified routes only
router.use(verifyJwt);
router.route("/logout").post(upload.none(), logout);
router.route("/remove-user").post(upload.none(),removeUser);
router.route("/change-pass").post(upload.none(), changePassword);
router.route("/getcurruser").get(getCurrentUser)
router.route("/update-acc-details").patch(upload.none(), updateAccountDetails);
router.route("/update-avatar").post(upload.single("avatar") ,updateAvatar);
router.route("/update-cover").post(upload.single("coverImage") ,updateCoverImage);
router.route("/remove-cover").post(removeCoverImage);
router.route("/remove-avtar").post(removeAvatar);
router.route("/channel/:channelName").get(getUserChannelInfo);
router.route("/watch-history").get(getWatchHistory);
router.route("/toggleSubsPrivacy").post(toggleSubscriptionPrivacy);


export default router;



