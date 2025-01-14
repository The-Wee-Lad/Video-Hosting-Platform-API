import mongoose, {Schema, model} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
},{timestamps : true});

const const Subscriptions = model("Subscriptions",subscriptionSchema);
