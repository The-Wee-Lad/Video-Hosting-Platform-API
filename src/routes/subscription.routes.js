import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers";
const subsRouter = Router();

subsRouter.use(verifyJwt);
subsRouter.route("/c/:channel").post(toggleSubscription).get(getSubscribedChannels);
subsRouter.route("/my-subscribers").get(getUserChannelSubscribers);

export { subsRouter }