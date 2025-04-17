import { asyncHandler } from "../utilities/asyncHandler.js"
import { Videos } from "../models/videos.model.js"
import { Comments } from "../models/comments.model.js"
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js"
import { isValidObjectId } from "mongoose";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const video = await Videos.findById(videoId);
    // console.log(videoId, content, video);
    if (!videoId || !video) {
        throw new ApiError(400, "No such Video Found");
    }

    if (!content) {
        throw new ApiError(400, "No Content to Comment");
    }

    if (!video?.commentsEnabled) {
        throw new ApiError(400, "Comments Disabled");
    }
    if (!video?.isPublished) {
        throw new ApiError(400, "private video");
    }

    const comment = await Comments.create({
        video: video?._id,
        owner: req.user?._id,
        content: content,
    });

    if (!comment) {
        throw new ApiError(500, "Failed To create the comment at server");
    }

    res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment Successfully Created"));
    console.log("Comment addded Successfully");
});

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params?.commentId;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Id");
    }
    const deletedComment = await Comments.findOneAndDelete({ _id: commentId, owner: req.user?._id });
    if (!deletedComment) {
        throw new ApiError(400, "Could not delete comment : Comment Not Found");
    }
    res.status(200).json(new ApiResponse(200, {}, "Comment Deleted SuccessFully"));
    console.log("Comment deleted");

});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Id");
    }
    if (!content) {
        throw new ApiError(400, "No Content to update");
    }

    const owner = await Comments.findOne({ _id: commentId, owner: req.user?._id });
    // console.log("Comment id : ",commentId,"\nContent : ",content,"\nOwner : ", req.user?._id, owner);
    // console.log(owner);
    const updatedComment = await Comments.findOneAndUpdate({ _id: commentId, owner: req.user?._id }, { $set: { content: content },  },{new:true});
    // console.log("updatedComment: ", updatedComment);

    if (!updatedComment) {
        throw new ApiError(400, "Failed To Update the comment : Comment Not Found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment Successfully Updated"));
    console.log("Comment Updated");
});

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const video = await Videos.findById(videoId);
    if (!video) {
        throw new ApiError(400, "No Video Found");
    }

    if (video.commentsEnabled == false) {
        throw new ApiError(403, "Comments Turned Off");
    }
    if (video.isPublished == false && video?.owner?._id.toString() != req?.user?._id.toString()) {
        throw new ApiError(403, "private Video");
    }
    
    const videoComments = await Comments.aggregate([
        {
            $match: {
                video: video?._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            email: 0,
                            watchHistory: 0,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes",
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes"
                }
            }
        },
        {
            $skip: parseInt(skip)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    console.log(videoComments);
    new ApiResponse()
    res.status(200).json(new ApiResponse(200, videoComments, "All comments fetched."));
    console.log("All Comments Fetched");
});

export {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
}