import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Users } from "../models/users.models.js";
import { cookieOptions } from "../constants.js";

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
    .json(new ApiResponse(200,user,"User authenticated"));

});

export { 
    registerUser,
    loginUser
};