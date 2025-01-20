import { Videos } from "../models/videos.models.js";
import { Users } from "../models/users.models.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js"
import { uploadOnCloudinary } from "../utilities/cloudinary.js"
import { ApiResponse } from "../utilities/ApiResponse.js";

const publishVid = asyncHandler( async (req, res) => {
    const { title, description, publish = true} = req.body;
    if(!title || !description){
        throw new ApiError(400," Title and Desvription Both are required ");
    }

    const videoPath = req?.files?.video[0].path ,
            thumbnailPath =  req?.files?.thumbnail[0].path;
    
    if(!videoPath || !thumbnailPath){
        throw new ApiError(400," Video and thumbnail Both are required ");
    }
    
    const videoResponse = (await uploadOnCloudinary(videoPath));
    const thumbnailResponse = (await uploadOnCloudinary(thumbnailPath));
    const videoUrl = videoResponse.url;
    const thumbnailUrl = thumbnailResponse.url;
    const videoDuration = videoResponse.duration;


    if(!videoUrl || !thumbnailUrl){
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
        owner: req.user?._id 
    });

    if(!video){
        throw new ApiError(500,"Video could not be uploaded, DBserver error");
    }

    res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully."))
}); 

const tooglePublish = asyncHandler( async (req, res) => {
    const videoId = req.params;

    if(!videoId){
        throw new ApiError(400,"Strange How is this Even Possible?");
    }

    const video = await Videos.findById(videoId);

    if(!video){
        throw new ApiError(404,"No Such Video Exists");
    }

    if(video.owner != req.user?._id){
        throw new ApiError(401,"Unauthorised Access");
    }

    const newVideo = await Videos.findByIdAndUpdate(video.videoFile, [
        {
            $set:{
                isPublished: {$not : "$isPublished"}
            }
        }
    ]);

    res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video Publish status changed to "+newVideo.isPublished));
});

const getVideoById = asyncHandler( async (req, res) => {
    const videoId = req.params;

    if(!videoId){
        throw new ApiError(400,"Strange How is this Even Possible?");
    }
    const video = await Videos.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video Does Not Exists")
    }

    if(!video.isPublished && video.owner != req.user?._id){
        throw new ApiError(401,"Requested Video is Private");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))

});

const updateVideo = asyncHandler( async (req, res) => {

    const videoId = req.params;
    const { title, description, published} = req.body;

    if(!videoId){
        throw new ApiError(400,"Strange How is this Even Possible?");
    }

    const video = await Videos.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video Does Not Exists")
    }

    if(video.owner != req.user?._id){
        throw new ApiError(401,"Unauthorised Access");
    }

    video.title = title || video.title,
    video.description = description || video.description;
    video.isPublished = published ?? video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))

});

const deleteVideo = asyncHandler( async (req, res) => {
    const videoId = req.params;

    if(!videoId){
        throw new ApiError(400,"Strange How is this Even Possible?");
    }
    const video = await Videos.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video Does Not Exists");
    }

    if(video.owner != req.user?._id){
        throw new ApiError(401,"Unauthorised Request");
    }

    const response = await Videos.findByIdAndDelete(video.videoFile);

    if(!response){
        throw new ApiError(500, "Couldnt Delete The Video");
    }

    res.status(200).json(new ApiResponse(200, response, "Video deleted successfully"));

});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1,
            limit = 10,
            query = "",
            sortBy = ["views", "createdAt", "duration"],
            sortType = [-1,-1,-1],
            userId
            } = req.query;

    //deafult is relevance here. I am just putting one more sortCategory forwarded by frontend under it.
    const sortByCategories = ["createdAt", "duration", "views"];
    const queryFilter = {};
    
    if(userId){
        queryFilter.userId  = userId;
        if(!(await Users.findById(userId))){
            throw new ApiError(400," Userid not Found");      
        }
    }
    
    query = query?.trim();
    queryFilter["$text"] = {
        "$search" : query
    };
    
    const sortFilter = {"score" : {$meta : "textScore"}};
    if(sortBy){
        for (const [index,elem] of sortBy.entries())
        {
            if(!Object.keys(sortByCategories).includes(elem)){
                throw new ApiError(400,"sortBy array includes Invalid Sorting By Category Type");
            }
            sortFilter[elem] = sortType[index];
        }
    }
    
    page = page < 1 ? 0 :page-1;
    const skip = page*limit;
    
    const queryResult = await Videos.aggregate([
        {$match : queryFilter},
        {$addFields : {"score" : {$meta : "textScore"}}},
        {$count: "totalCount"},
        {$sort: sortFilter}
    ]).skip(skip).limit(limit);

    if(typeof queryResult === undefined){
        throw new ApiError(500," No Query result from MongoDB");
    }

});

export { publishVid, tooglePublish, getVideoById, updateVideo, deleteVideo, getAllVideos}