import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

console.log(process.env.CLOUDINARY_NAME);

export const uploadSingleFile = async (file: UploadedFile): Promise<string | null> => {
    try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "teacher_documents",
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};