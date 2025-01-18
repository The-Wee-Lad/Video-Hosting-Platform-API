import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers.js";
const router = Router();

router.use(verifyJwt);
router.route("/c/:channel").post(toggleSubscription).get(getSubscribedChannels);
router.route("/my-subscribers").get(getUserChannelSubscribers);

export default router;