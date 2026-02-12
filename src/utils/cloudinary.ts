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


/**
 * Universal Image Upload Function
 * @param file UploadedFile (from express-fileupload)
 * @param folder Cloudinary folder name (optional)
 */
export const uploadImage = async (
  file: UploadedFile,
  folder: string = "uploads"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 🔒 Image validation
    if (!file.mimetype.startsWith("image/")) {
      return reject(new Error("Only image files are allowed"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image", // image only
        format: "png", // optional: normalize format
      },
      (error, result) => {
        if (error) reject(error);
        else resolve((result as UploadApiResponse).secure_url);
      }
    );

    stream.end(file.data); // 👈 buffer upload (Vercel safe)
  });
};



