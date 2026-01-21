import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Helper to upload a File (from FormData) to Cloudinary
 */
export async function uploadToCloudinary(file: File, folder: string = 'agentlink_uploads') {
  // Convert the File to a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Return a Promise to handle the async upload stream
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder, // Organize uploads into a specific folder
        resource_type: 'auto', // Auto-detect (image, pdf, etc.)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
          return;
        }
        resolve(result);
      }
    ).end(buffer);
  });
}

/**
 * Helper to delete a file from Cloudinary (useful for cleanups)
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw error;
  }
}

export default cloudinary;
