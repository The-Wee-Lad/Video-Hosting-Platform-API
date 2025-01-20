import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema({
    content: {
        type : String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Videos"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
}, {timestamps: true});


export const Comments = mongoose.model("Comments", commentSchema);