import mongoose, {isValidObjectId} from "mongoose"
import {Playlists} from "../models/playlist.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import { Videos } from "../models/videos.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, isPublic} = req.body;

    if(!name || ! description){
        throw new ApiError(400,"All feilds Required");
    }
    
    const newPlayList = await Playlists.create({
        name : name,
        description: description,
        owner: req.user?._id,
        isPublic : isPublic
    });

    res.status(200).json(new ApiResponse(200, newPlayList,"Playlist created"));

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id");
    }

    const playlist = await Playlists.aggregate([
        {
            $match:{
                $or:[
                    {isPublic:true},
                    {owner: new mongoose.Types.ObjectId(req.user?._id)}
                ],
                _id: new mongoose.Types.ObjectId(playlistId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            email:0,
                            password:0,
                            refreshToken:0
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $match:{
                            $or:[
                                {isPublished:true},
                                {owner:new mongoose.Types.ObjectId(req.user?._id)}
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
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
                        $unwind:"$owner"
                    }
                ]
            }
        },
    ]);

    if(!playlist){
        throw new ApiError("No Playlist Found!");
    }

    res.status(200).json(new ApiResponse(200, playlist,"This is the video hosting website"));
})


const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id");
    }
    let deletedPlaylist = await Playlists.findById(playlistId);
    if(!deletedPlaylist){
        throw new ApiError(400,"No Such Playlist Found");
    }
    res.status(200).ApiResponse(200,"Playlist Deleted");
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id");
    }
    if(!name || !description){
        throw new ApiError(400, "All fields are required");
    }
    const newPlayList = Playlists.findByIdAndUpdate(playlistId,{
        $set:{
            name : name,
            description: description,
        }
    });
    if(!newPlayList){
        throw new ApiError(400," No Such Playlist exist");
    }

    res.status(200).json(new ApiResponse(200, newPlayList, "Palylist Updated"));

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video = await Videos.findById(videoId);
    const playlist = await Playlists.findById(playlistId);
    if(!video){
        throw new ApiError(400, "Video Not Found!!")
    }
    if(!playlist){
        throw new ApiError(400, "Playlist Not Found!!")
    }

    playlist.videos.push(video._id);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video Added To playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video = await Videos.findById(videoId);
    const playlist = await Playlists.findById(playlistId);
    if(!video){
        throw new ApiError(400, "Video Not Found!!")
    }
    if(!playlist){
        throw new ApiError(400, "Playlist Not Found!!")
    }


    const index  = playlist.videos.indexOf(video._id);
    if(index<0){
        throw new ApiError(400, "No such video in playlist");
    }

    playlist.splice(index, 1);
    const newPlaylist = await playlist.save();
    
    res.status(200).json(new ApiResponse(200,newPlaylist,"Video Removed from playlist"));
})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}