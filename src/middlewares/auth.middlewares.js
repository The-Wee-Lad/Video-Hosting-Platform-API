import jwt from "jsonwebtoken"
import { asyncHandler } from "../utilities/asyncHandler.js"
import { ApiError } from "../utilities/ApiError.js";
import { Users } from "../models/users.models.js";

const verifyJwt = asyncHandler( async (req, res, next) => {
    
    try {
        const receivedAccessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer","")?.trim();
        console.log( receivedAccessToken );
        
        if(!receivedAccessToken){
            throw new ApiError(401,"Unauthorised Access");
        }
    
        const decodedAccessToken = jwt.verify(receivedAccessToken, process.env.ACCESS_TOKEN_SECRET);
        const user =await Users.findById(decodedAccessToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,`JWT Access Token could not be verified : ${error.name} : ${error.message}`);
    }
    
})

export { verifyJwt };