const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const logger = require('../config/logger');

const isConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

if (isConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

const FOLDER = 'jobhive';

const uploadBuffer = async ({ buffer, publicId, resourceType = 'auto' }) => {
  if (!isConfigured()) throw new Error('Cloudinary is not configured');
  const result = await cloudinary.uploader.upload(`data:${resourceType}/octet-stream;base64,${buffer.toString('base64')}`, {
    folder: FOLDER,
    public_id: publicId || undefined,
    resource_type: 'auto',
    use_filename: false,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const uploadFile = async ({ filePath, publicId, resourceType = 'auto' }) => {
  if (!isConfigured()) throw new Error('Cloudinary is not configured');
  const result = await cloudinary.uploader.upload(filePath, {
    folder: FOLDER,
    public_id: publicId || undefined,
    resource_type: resourceType,
    use_filename: false,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const uploadImage = async ({ filePath, publicId }) => uploadFile({ filePath, publicId });

const removeByPublicId = async (publicId) => {
  if (!isConfigured() || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn(`[cloudinary] failed to delete ${publicId}: ${err.message}`);
  }
};

module.exports = {
  isConfigured,
  uploadBuffer,
  uploadFile,
  uploadImage,
  removeByPublicId,
};
