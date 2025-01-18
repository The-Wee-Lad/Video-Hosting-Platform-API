import { asyncHandler } from "../utilities/asyncHandler.js"
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Users } from "../models/users.models.js";
import { Subscriptions } from "../models/subscription.models.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler( async (req, res) => {

    const {channel} = req.params;
    

    const channelDoc = await Users.findOne({username : channel});
    if(!channelDoc){
        throw new ApiError(404,"No such Channel Exists");
    }

    const subscription = Subscriptions.findOne({
        channel: channelDoc?._id,
        subscriber: req.user?._id
    });

    let data = {}, message;
    if(subscription){
        await Subscriptions.findByIdAndDelete(subscription?._id);
        message = "Subscription Successfully Removed";
    }else{
        data = await Subscriptions.create({
            channel: channelDoc?._id,
            subscriber: req.user?._id
        });
        message = "Subscription Successfully created";
    }

    res.status(200).json(new ApiResponse(200, data, message));
});

const getUserChannelSubscribers = asyncHandler( async (req, res) => {
    // const user = await Users.findById(req.user?._id);

    const user = await Users.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        }
        ,
        {
            $lookup: {
                from: "users",
                localField: "subscribers.subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline:[
                    {
                        $match:{
                            privateSubscription: false
                        }
                    },
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1,
                            coverImage:1,
                        }
                    }
                ]
            }
        },
        {
            $project:{
                password:0,
                refreshToken:0
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200,user[0].subscribers,"Subscribers Fetched successfully"));

});

const getSubscribedChannels = asyncHandler( async (req, res) => {
    const {channel} = req.params;
    

    const channelDoc = await Users.findOne({username : channel});
    if(!channelDoc){
        throw new ApiError(404,"No such Channel Exists");
    }

    if(channelDoc?._id != req.user?._id && channelDoc?.privateSubscription){
        throw new ApiError(401, "Channels Subscriptions List is Private for this channel");
    }
    
    const user = await Users.aggregate([
        {
            $match: {
                username: "adi123"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channelsSubscribed",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "channel",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "channel",
                            foreignField: "_id",
                            as: "channelDetails",
                        }
                    },
                    {
                        $unwind: "$channelDetails"
                    },
                    {
                        $addFields: {
                            subscriptionCount: {
                                "$size": "$subscribers"
                            },
                            fullname: "$channelDetails.fullname",
                            channelname: "$channelDetails.username",
                            avatar: "$channelDetails.avatar"
                        }
                    },
                    {
                        $project: {
                            channelDetails: 0,
                            subscribers: 0
                        }
                    }
                ]
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                email: 0,
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200,user[0].channelsSubscribed, "List of subscribed channels returned"));
}
);


export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
};

