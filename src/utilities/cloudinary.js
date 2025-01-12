import { v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
    try {

        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        if(!localFilePath || !fs.existsSync(localFilePath))  return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("File upload Error occurred !!!",error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}


export { uploadOnCloudinary };