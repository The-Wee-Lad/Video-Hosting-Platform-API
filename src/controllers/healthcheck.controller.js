import { ApiResponse } from "../utilities/ApiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";


const healthcheck = asyncHandler( async (req, res) => {
    res
    .status(200)
    .json(new ApiResponse(200,{},"Everything is ok"));
});

export { healthcheck };