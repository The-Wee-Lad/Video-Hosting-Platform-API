import { Videos } from "../models/videos.model.js";
import { Users } from "../models/users.model.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js"
import { uploadOnCloudinary, deleteOnCloudinary, extractPublicId } from "../utilities/cloudinary.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import ora from 'ora';

const publishVid = asyncHandler(async (req, res) => {
    let { title, description, publish = true, comments = true } = req.body;
    if (!title || !description) {
        throw new ApiError(400, " Title and Desvription Both are required ");
    }
    publish = (publish === "true") ? true : false;
    comments = (comments === "true") ? true : false;
    const videoPath = req?.files?.video[0].path,
        thumbnailPath = req?.files?.thumbnail[0].path;

    if (!videoPath || !thumbnailPath) {
        throw new ApiError(400, " Video and thumbnail Both are required ");
    }

    const spinner1 = ora('Uploading video To Cloudinary...').start();
    const videoResponse = (await uploadOnCloudinary(videoPath));
    spinner1.succeed('Upload complete!');
    const spinner2 = ora('Uploading Thumbnail to Cloudinary...').start();
    const thumbnailResponse = (await uploadOnCloudinary(thumbnailPath));
    spinner2.succeed('Upload complete!');
    const videoUrl = videoResponse.url;
    const thumbnailUrl = thumbnailResponse.url;
    const videoDuration = videoResponse.duration;


    if (!videoUrl || !thumbnailUrl) {
        throw new ApiError(500, "Couldn't Upload Files to Cloudinary");
    }

    const video = await Videos.create({
        videoFile: videoUrl,
        thumbnail: thumbnailUrl,
        title: title,
        description: description,
        duration: videoDuration,
        views: 0,
        isPublished: publish,
        commentsEnabled: comments,
        owner: req.user?._id
    });

    if (!video) {
        throw new ApiError(500, "Video could not be uploaded, DBserver error");
    }

    res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully."))
    console.log("Video uploaded Successfully By User");
});

const togglePublish = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const video = await Videos.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No Such Video Exists");
    }

    if (video.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorised Access");
    }

    const newVideo = await Videos.findByIdAndUpdate(video._id, [
        {
            $set: {
                isPublished: { $not: "$isPublished" }
            },
        }
    ]);

    res
        .status(200)
        .json(new ApiResponse(200, newVideo, "Video Publish status changed to " + newVideo.isPublished));
});

const toggleComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }

    const video = await Videos.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No Such Video Exists");
    }

    if (video.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorised Access");
    }


    const newVideo = await Videos.findByIdAndUpdate(video._id, [
        {
            $set: {
                commentsEnabled: { $not: "$commentsEnabled" }
            }
        }
    ]);

    res
        .status(200)
        .json(new ApiResponse(200, newVideo, "Video Comments status changed to " + newVideo.commentsEnabled));
});

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }
    const video = await Videos.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            email: 0,
                            password: 0,
                            refreshToken: 0,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ]);

    if (!video[0]) {
        throw new ApiError(404, "Video Does Not Exists")
    }

    if (!video[0]?.isPublished && video[0]?.owner?._id.toString() != req.user?._id.toString()) {
        throw new ApiError(401, "Requested Video is Private");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))

});

const updateVideo = asyncHandler(async (req, res) => {

    const {videoId} = req.params;
    let { title, description, published } = req.body;

    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }
    
    const video = await Videos.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video Does Not Exists")
    }
    
    if (video.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorised Access");
    }
    
    published = published=="true"?true:(published == "false")?false:video.isPublished;
    video.title = title || video.title,
        video.description = description || video.description;
    video.isPublished = published ?? video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))

});

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Id");
    }
    const video = await Videos.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video Does Not Exists");
    }

    if (video.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorised Request");
    }

    const spinner1 = ora('Deleting video from Database...').start();
    const response = await Videos.findByIdAndDelete(video._id);
    spinner1.succeed();
    console.log(response.videoFile,extractPublicId(response.videoFile));
    const spinner2 = ora('Deleting video from Cloudinary...').start();
    await deleteOnCloudinary(extractPublicId(response.videoFile),"video");
    spinner2.succeed();
    console.log(response.thumbnail,extractPublicId(response.thumbnail));
    const spinner3 = ora('Deleting thumbnail from Cloudinary...').start();
    await deleteOnCloudinary(extractPublicId(response.thumbnail));
    spinner3.succeed();

    
    if (!response) {
        throw new ApiError(500, "Couldnt Delete The Video");
    }

    res.status(200).json(new ApiResponse(200, response, "Video deleted successfully"));

});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1,
        limit = 10,
        query = "",
        sortBy = ["views", "createdAt", "duration"],
        sortType = [-1, -1, -1],
        userId
    } = req.query;

    //deafult is relevance here. I am just putting one more sortCategory forwarded by frontend under it.
    const sortByCategories = ["createdAt", "duration", "views"];
    const queryFilter = {};

    if (userId) {
        if (userId != req.user?._id)
            queryFilter.isPublished = true;
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid Id");
        }
        queryFilter.userId = new mongoose.Types.ObjectId(userId);
        if (!(await Users.findById(userId))) {
            throw new ApiError(400, " Userid not Found");
        }
    }

    query = query?.trim();
    queryFilter["$text"] = {
        "$search": query
    };

    const sortFilter = { "score": { $meta: "textScore" } };
    if (sortBy) {
        for (const [index, elem] of sortBy.entries()) {
            if (!Object.keys(sortByCategories).includes(elem)) {
                throw new ApiError(400, "sortBy array includes Invalid Sorting By Category Type");
            }
            sortFilter[elem] = sortType[index];
        }
    }

    page = page < 1 ? 0 : page - 1;
    const skip = page * limit;

    const queryResult = await Videos.aggregate([
        { $match: queryFilter },
        {
            $facet: {
                videos:
                    [
                        {
                            $addFields: { "score": { $meta: "textScore" }, }
                        },
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "owner",
                                as: "owner",
                            }
                        },
                        {
                            $unwind: "$owner"
                        },
                        {
                            $project: {
                                "owner.email": 0,
                                "owner.password": 0,
                                "owner.refreshToken": 0,
                            }
                        },
                        { $sort: sortFilter },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                totalCount: [
                    {
                        $count: "count"
                    }
                ]
            }
        },
        {
            $project: {
                totalCount: { $arrayElemAt: ["$totalCount.count", 0] }
            }
        }
    ]);

    if (typeof queryResult === undefined) {
        throw new ApiError(500, " No Query result from MongoDB");
    }

    res.status(200).json(200, queryResult, "Fetch all videos based on query with totalCount");
});

export {
    publishVid,
    togglePublish,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos,
    toggleComments
}