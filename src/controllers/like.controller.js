import {isValidObjectId} from "mongoose"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import { Likes } from "../models/likes.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Id");
    }

    const check = await Likes.findOneAndDelete({video:videoId});
    if(check){
        res.status(200).json(200,{},"Successfully Removed");
    }

    const newLike = await Likes.create({
        video: videoId,
        likedBy: req.user?._id
    });

    res.send(200).json(new ApiResponse(200,"Liked the video"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Id");
    }

    const check = await Likes.findOneAndDelete({comment:commentId});
    if(check){
        res.status(200).json(200,{},"Successfully Removed");
    }

    const newLike = await Likes.create({
        video: commentId,
        likedBy: req.user?._id
    });

    res.send(200).json(new ApiResponse(200,newLike,"Liked the comment"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Id");
    }

    const check = await Likes.findOneAndDelete({tweet:tweetId});
    if(check){
        res.status(200).json(200,{},"Successfully Removed");
    }

    const newLike = await Likes.create({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    res.send(200).json(new ApiResponse(200,"Liked the tweet"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    
    const likedVideos = Likes.aggregate([
        {
            $match: {
                likedBy: req.user?._id,
                video: {$exists:true},
                comment: {$exists:false},
                tweet:{$exists:false}
            }
        },
        {
            $lookup:{
                from: video,
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        email:0,
                                        password:0,
                                        refreshToken:0,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$owner"
                    }
                ]
            }
        },
        {
            $unwind:"$video"
        },
        {
            $count: "TotalNumberOfLikedVideos"
        }
    ]);
    res.status(200).json(200,likedVideos,"Fetched all liked videos");
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
}

