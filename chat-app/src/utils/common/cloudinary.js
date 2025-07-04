import axios from "axios";


export const uploadToCloudinary = async (file) => {
    console.log(file,'file ssssssssss')
  const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'chat-app');
    // formData.append('cloud_name', 'dbfpk9qoh')

  try {
    const response = await axios.post('https://api.cloudinary.com/v1_1/dbfpk9qoh/image/upload',formData);
    return response.data.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload ");
  }
};



