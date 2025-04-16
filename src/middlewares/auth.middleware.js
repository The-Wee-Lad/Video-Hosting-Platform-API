import jwt from "jsonwebtoken"
import { asyncHandler } from "../utilities/asyncHandler.js"
import { ApiError } from "../utilities/ApiError.js";
import { Users } from "../models/users.model.js";

const verifyJwt = asyncHandler( async (req, res, next) => {
    
    try {
        const receivedAccessToken = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer","")?.trim();
        
        if(!receivedAccessToken){
            throw new ApiError(401,"Unauthorised Access [No Token Found]");
        }
    
        const decodedAccessToken = jwt.verify(receivedAccessToken, process.env.ACCESS_TOKEN_SECRET);
        const user =await Users.findById(decodedAccessToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid Access Token [Token faolire");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,`JWT Access Token could not be verified : ${error.name} : ${error.message}`);
    }
    
})

export { verifyJwt };