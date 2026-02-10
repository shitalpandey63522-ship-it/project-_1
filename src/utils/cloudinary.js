import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    console.log("File uploaded on Cloudinary:", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// Upload from URL
cloudinary.uploader.upload(
  "https://www.bing.com/th/id/OIP.S7mF_I_K87ILIt8xsnsALAHaEo?w=203&h=128&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  { public_id: "lotus" },
  function (error, result) {
    if (error) {
      console.error("Upload failed:", error);
    } else {
      console.log("Upload success:", result);
    }
  }
);

export { uploadOnCloudinary };
