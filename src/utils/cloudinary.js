const { v2 } = require('cloudinary');
const { removeLocalFile } = require('../utils/helper');

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error(
    'Cloudinary configuration is incomplete. Make sure to set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
  );
}

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localPath) {
  try {
    if (!localPath) return null;
    const response = await v2.uploader.upload(localPath);

    removeLocalFile(localPath, false);
    return response;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    removeLocalFile(localPath, false);
    return null;
  }
}

const deleteImageOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }
    let response = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    return response;
  } catch (error) {
    return null;
  }
};

module.exports = { uploadOnCloudinary, deleteImageOnCloudinary };
