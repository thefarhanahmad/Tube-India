const cloudinary = require('cloudinary').v2;

/**
 * Extracts the public_id from a Cloudinary URL
 * @param {string} url The Cloudinary URL
 * @returns {string|null} The public_id or null if not found
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // The public_id starts after the version (v12345678) or directly after 'upload'
    // Versions usually start with 'v' followed by digits
    const nextPart = parts[uploadIndex + 1];
    const publicIdWithExtension = (nextPart && nextPart.match(/^v\d+$/))
      ? parts.slice(uploadIndex + 2).join('/')
      : parts.slice(uploadIndex + 1).join('/');
      
    // Remove the extension (.jpg, .mp4, etc.)
    return publicIdWithExtension.split('.')[0];
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Deletes an asset from Cloudinary
 * @param {string} url The Cloudinary URL of the asset to delete
 * @param {string} resourceType 'image' or 'video'
 */
const deleteFromCloudinary = async (url, resourceType = 'image') => {
  if (!url || url.includes('default-avatar.png')) return;

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted ${resourceType} from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete ${resourceType} from Cloudinary:`, error);
  }
};

module.exports = {
  getPublicIdFromUrl,
  deleteFromCloudinary,
};
