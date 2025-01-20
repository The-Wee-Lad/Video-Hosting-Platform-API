import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { uploadOnCloudinary,
        deleteOnCloudinary,
        extractPublicId,
} from "../utilities/cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Users } from "../models/users.model.js";
import { cookieOptions } from "../constants.js";
import jwt from "jsonwebtoken";
import mongoose, { Mongoose, Schema } from "mongoose";

const generateAccessAndRefreshToken = async (userid) => {
    
    try {
        
        const user = await Users.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();        
        return { accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500,"Couldn't Generate refereshToken and accessToken");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    
    // getting user details from frontend through req.body;
    const {fullname, email, username, password} = req.body;
    
    // checking if the data sent is valid
    if([fullname, email, username, password].some((field) => {
        return (field?.trim() === "") || !(field);
        })) {
        throw new ApiError(400,"All Feilds are Required");
    }

    //checking if User already exits
    if(await Users.findOne({$or : [{username : username}, {email : email}]})){
        throw new ApiError(409,"User Already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    //Checking if avatar image is included or not
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image required");
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(coverLocalPath);

    if(!avatarResponse){
        throw new ApiError(500,"Failed to upload the avatar image");
    }

    const user = await Users.create([{
        fullname: fullname,
        email: email,
        username: username.toLowerCase(),
        password: password,
        avatar: avatarResponse.url,
        coverImage: coverImageResponse?.url ?? ""
    }]);

    const createdUser =  await Users.findById(user[0]._id).select("-password -refreshToken");
    
    if(!createdUser){
        throw new ApiError(500,"Error in database Operation Create : USER");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User Created SuccessFully"));
    
});

const loginUser = asyncHandler( async (req, res) => {

    const {usernameOrEmail : userid, password} = req.body;
    
    if([userid, password].some((elem) => {
        return !(elem?.trim()) || !elem})){
        throw new ApiError(400, "All feilds are required");
    }

    let user =await Users.findOne({$or : [{username: userid}, {email: userid}]});
    
    if(!user){
        throw new ApiError(404,"No Such User Exists ");
    }

    if(!(await user.isPasswordCorrect(password))){
        throw new ApiError(401," Invalid Credentials ");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    user = await Users.findById(user._id).select("-password -refreshToken");
    
    
    

    res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(new ApiResponse(200,{user: user, accessToken, refreshToken},"User authenticated"));

});

const refreshAccessToken = asyncHandler( async (req, res) => {
    try {
        const receivedRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
        const decodedRefreshToken = jwt.verify(receivedRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userid = decodedRefreshToken?._id;
        const user = await Users.findById(userid);

        if(!user){
            throw new ApiError(401," Invalid Refresh Token");
        }

        const storedRefreshToken = user?.refreshToken;

        if(storedRefreshToken !==  receivedRefreshToken){
            throw new ApiError(401,"Refresh Token Expired");
        }

        const {accessToken, refreshToken} =await generateAccessAndRefreshToken(user?._id);        
        
        res
        .status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken)
        .json(new ApiResponse(200,{accessToken, refreshToken},"new accessToken generated successfully"))

    } catch (error) {
        throw new ApiError(401,`JWT Refresh Token could not be verified : ${error.name} : ${error.message}`);
    }
});

const logout = asyncHandler( async (req, res) => {

    const user = await Users.findByIdAndUpdate(req.user._id, {$set: {refreshToken: null}}, {new: true});
    
    if(!user || user.refreshToken){
        throw new ApiError(500,"could not change database");  
    }
    res
    .status(200)
    .clearCookie("refreshToken",cookieOptions)
    .clearCookie("accessToken",cookieOptions)
    .json(new ApiResponse(200,{},"User Logged Out"));
});


const changePassword = asyncHandler( async (req,res) => {
    
    const {oldPassword, newPassword, confirmPassword} = req.body;
    
    if([oldPassword, newPassword, confirmPassword].some((elem => {
        return !(elem?.trim());
    }))){
        throw new ApiError(400,"All feilds are required");
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400,"confirm Password doesn't match the new Password!!");
    }

    let user = req.user;
    if(!(await user.isPasswordCorrect(oldPassword))){
        throw new ApiError(400,"Not Correct Password");
    }

    user = await Users.findById(user?._id);
    user.password = newPassword;
    const {accessToken, refreshToken} =await generateAccessAndRefreshToken(user?._id);
    user.save();
    
    res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {accessToken, refreshToken}, "Password Changed Carefully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await Users.findById(req.user._id).select("-refreshToken -password");
    if(!user){
        throw new ApiError(401,"Unexected error occurred in getCurrentUser");
    }
    res
    .status(200)
    .json(new ApiResponse(200, user, "Current user Data SuccessFully sent"));
});

const updateAccountDetails = asyncHandler( async (req,res) => {
    
    let {username, email, fullname} = req.body;
    username = username || req.user?.username;
    email = email || req.user?.email;
    fullname = fullname || req.user?.fullname;

    if(username != req.user.username && await Users.findOne({username : username})){
        throw new ApiError(409,"Username Already Taken");
    }

    if(email != req.user?.email && await Users.findOne({email : email})){
        throw new ApiError(409,"Email Already Used");
    }

    const user = await Users.findByIdAndUpdate(req.user._id,{
            $set : {
                username : username,
                email : email,
                fullname : fullname
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken");

    if(!user){
        throw new ApiError(409," Database change could not take plase ");
    }
    res.status(200).json(new ApiResponse(204,user, "Changed SuccessFully"));

});


const updateAvatar= asyncHandler( async (req, res) => {

    const uploadFilepath = req?.file?.path;

    if(!uploadFilepath){
        throw new ApiError(400, "File could not be parsed correctly or missing");
    }

    const cloudinaryFileUrl = (await uploadOnCloudinary(uploadFilepath)).url;

    if(!cloudinaryFileUrl){
        throw new ApiError(500, "File could not be Uploaded to cloudinary");
    }

    const user = await Users.findByIdAndUpdate(req.user?._id, {
            $set: {
                avatar: cloudinaryFileUrl
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken");
    
    if(!user){
        throw new ApiError(500,"Database error occurred with no upload or fetch of file of File Url");
    }

    await deleteOnCloudinary(extractPublicId(req.user?.avatar))

    res.status(200).json(new ApiResponse(200,user,"Avatar Updated"));
});


const updateCoverImage= asyncHandler(
    async (req, res) => {

        const uploadFilepath = req?.file?.path;
    
        if(!uploadFilepath){
            throw new ApiError(400, "File could not be parsed correctly or missing");
        }
    
        const cloudinaryFileUrl = (await uploadOnCloudinary(uploadFilepath)).url;
    
        if(!cloudinaryFileUrl){
            throw new ApiError(500, "File could not be Uploaded to cloudinary");
        }
    
        const user = await Users.findByIdAndUpdate(req.user?._id, {
                $set: {
                    coverImage: cloudinaryFileUrl
                }
            },
            {
                new : true
            }
        ).select("-password -refreshToken");
        
        if(!user){
            throw new ApiError(500,"Database error occurred with no upload or fetch of file of File Url");
        }
    
        await deleteOnCloudinary(extractPublicId(req.user?.coverImage));

        res.status(200).json(new ApiResponse(200,user,"Cover Image Updated"));
    }
);

const getUserChannelInfo = asyncHandler( async(req, res) => {

    const {channelName} = req.params;
    if(!channelName?.trim()){
        throw new ApiError(400,"Invalid Channel Name");
    }

    const channel = await  Users.aggregate([
        {
            $match: {
                username : channelName.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed"
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedCount: {
                    $size: "$subscribed"
                },
                isSubscribed: {
                    $cond:{
                        if: {  $in: [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullname: 1,
                subscribedCount: 1,
                subscribersCount: 1,
                // subscribed: 1,
                // subscribers: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ]);

    console.log(channel);
    
    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist");
    }

    res.status(200).json(new ApiResponse(200, channel[0], "User Channel fetched successfully"));
})

const getWatchHistory = asyncHandler( async (req, res) => {
    const user = await Users.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.usr?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        usename: 1,
                                    }
                                }
                            ]
                            
                        }
                    },
                ],
                pipeline:[
                    {
                        $addFields: {
                            "owner": {
                                $first: "$owner"
                            }
                        }
                    }   
                ]
            }
        }
    ]);

    const watchHistory = user[0].watchHistory;
    res.status(200).json(new ApiResponse(200, watchHistory, "Watch History Fetched Successfully"));
});

const toogleSubscriptionPrivacy = asyncHandler( async (req, res) => {
    
    const user = await Users.findById(req.user?._id);
    if(!user){
        throw new ApiError(500,"couldn't fetch the user")
    }
    user.privateSubscription = user.privateSubscription ^ true;
    const newStatus = user.privateSubscription;
    await user.save()

    res
    .status(200)
    .json(new ApiResponse(200, {"newSubscriptionPrivacyStatus" : newStatus}, "Toggled the privateSubscription status"));
})

const removeCoverImage = asyncHandler( async (req, res) => {

    const user = await Users.findByIdAndUpdate(req.user?._id, {
        $set : {
            coverImage : null
        }
    }).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500," Failed to Remove CoverImage from database");
    }

    await deleteOnCloudinary(extractPublicId(req.user?.coverImage));

    res.status(200).json(new ApiResponse(200,user,"Cover Image Removed"));    
});

const removeAvatar = asyncHandler( async (req, res) => {

    const user = await Users.findByIdAndUpdate(req.user?._id, {
        $set : {
            avatar : null
        }
    }).select("-password -refreshToken");

    if(!user){
        throw new ApiError(500," Failed to Remove Avatar from database");
    }

    await deleteOnCloudinary(extractPublicId(req.user?.avatar));

    res.status(200).json(new ApiResponse(200,user,"Avatar Image Removed"));    
});

const removeUser = asyncHandler( async (req, res) => {
    
    const response = await Users.findByIdAndDelete(req.user._id);
    
    if(!response){
        throw new ApiError(500,"could not change database");  
    }
    
    res
    .status(200)
    .clearCookie("refreshToken",cookieOptions)
    .clearCookie("accessToken",cookieOptions)
    .json(new ApiResponse(200,response,"User Removed"));
})

export { 
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelInfo,
    getWatchHistory,
    toogleSubscriptionPrivacy,
    removeCoverImage,
    removeAvatar,
    removeUser,
};

/*
TODO 

Models : like, comments, playlist, tweet(maybe)

Controllers and Routes : comment, dashboard, like,playlist, tweet

    getplaylist,getuserplaylist, getplaylistby id
    , addvideotoplaylist, removevideofromplaylist,
    update playlist

    create tweet , get user tweet, update tweets, delete tweets


*/