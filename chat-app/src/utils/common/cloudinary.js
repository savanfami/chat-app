import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app");

  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_CLOUDINARYURL}/${resourceType}/upload`,
      formData
    );
    return response.data.url;
  } catch (error) {   
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload ");
  }
};
