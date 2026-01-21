import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer (from FormData) to Cloudinary
 * @param file The file object from FormData
 * @param folder The folder in Cloudinary to store it (default: agentlink_uploads)
 */
export async function uploadToCloudinary(file: File, folder: string = 'agentlink_uploads') {
  // Convert the File to a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Return a Promise to handle the async upload stream
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Automatically detect image, pdf, etc.
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
          return;
        }
        if (result) {
          resolve({
            secure_url: result.secure_url, // The HTTPS link we save to DB
            public_id: result.public_id,   // The ID used if we ever need to delete it
          });
        }
      }
    ).end(buffer);
  });
}

/**
 * Deletes a file from Cloudinary (for cleanup)
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw error;
  }
}

export default cloudinary;
