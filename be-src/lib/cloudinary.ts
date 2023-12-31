import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Cloudinary
export async function uploadCloudinary(image) {
  try {
    const response = await cloudinary.uploader.upload(image,
      {
        resource_type: "image",
        discard_original_filename: true,
        witdh: 1000,
      })
    return response
  } catch (error) {
    throw error
  }
}





