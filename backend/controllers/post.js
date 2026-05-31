const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;

exports.createPost = async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tubeindia/posts',
      });
      imageUrl = result.secure_url;
    }
    if (!text && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Post text or image is required' });
    }
    const post = await Post.create({
      owner: req.user.id,
      text,
      imageUrl,
      visibility: req.body.visibility || 'public',
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const query = { visibility: 'public' };
    if (req.query.owner) query.owner = req.query.owner;
    const posts = await Post.find(query).populate('owner', 'name avatar channelName').sort('-createdAt');
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};
