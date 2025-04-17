import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



const uploadOnCloudinary = async (localFilePath) => {
    try {
        await cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        if (!localFilePath || !fs.existsSync(localFilePath)) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("File upload Error occurred !!!", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const extractPublicId = (url) => {
    let first = url.split('/upload/');

    if (first.length < 2) {
        throw Error("Invalid URL Path");
    }

    let second = (first[1].split('/'));
    let public_id = (second[second.length - 1].split('.'))[0]
    return public_id;
};

const deleteOnCloudinary = async (public_id, resource_type = "image") => {
    try {
        await cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        const result = await cloudinary.uploader.destroy(public_id,{ resource_type: resource_type });
        if (result.result != "ok")
            throw new Error("Cloudinary failed to delete, so either file doesn't exist or Cloudinary problem"+JSON.stringify(result)+"huh")

    }
    catch (err) {
        console.log("Couldn't Delete the file on Cloudinary : ", err);
    }
};

export { uploadOnCloudinary, extractPublicId, deleteOnCloudinary };