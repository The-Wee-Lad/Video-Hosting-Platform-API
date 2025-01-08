import mongoose, {Schema} from  'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type : String,
        required : [true, "Video File Required"]
    },
    thumbnail : {
        type : String,
        required : [true, "Thumbnail File Required"]
    },
    title : {
        type : String,
        required : [true, "Title is Required"]
    },
    description : {
        type : String,
        required : [true, "Description is Required"]
    },
    duration : {
        type : Number,
        required : [true, "Duration is Required"]
    },
    views : {
        type : String,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "Users"
    }
},
{timestamp : true});

videoSchema.plugin(mongooseAggregatePaginate)

export const Videos = mongoose.model("Videos",videoSchema);