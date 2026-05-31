const Comment = require('../models/Comment');
const Video = require('../models/Video');
const Notification = require('../models/Notification');

const createNotification = async ({ recipient, actor, type, video, comment, message }) => {
  if (!recipient || !actor || recipient.toString() === actor.toString()) return;
  await Notification.create({ recipient, actor, type, video, comment, message });
};

// @desc    Get comments for a video
// @route   GET /api/comments/:videoId
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'name avatar channelName')
      .populate('replies.user', 'name avatar channelName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const video = await Video.findById(req.body.video);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const comment = await Comment.create(req.body);
    await comment.populate('user', 'name avatar channelName');

    // Increment commentsCount in Video model
    video.commentsCount += 1;
    await video.save();
    await createNotification({
      recipient: video.owner,
      actor: req.user.id,
      type: 'video_comment',
      video: video._id,
      comment: comment._id,
      message: `${req.user.channelName || req.user.name} commented on your video`,
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle like on comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const userId = req.user.id.toString();
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.addToSet(req.user.id);
      await createNotification({
        recipient: comment.user,
        actor: req.user.id,
        type: 'comment_like',
        video: comment.video,
        comment: comment._id,
        message: `${req.user.channelName || req.user.name} liked your comment`,
      });
    }
    await comment.save();
    res.status(200).json({ success: true, likes: comment.likes, isLiked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to comment
// @route   POST /api/comments/:id/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ success: false, message: 'Reply text is required' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ user: req.user.id, text });
    await comment.save();
    await comment.populate('replies.user', 'name avatar channelName');
    const reply = comment.replies[comment.replies.length - 1];

    await createNotification({
      recipient: comment.user,
      actor: req.user.id,
      type: 'comment_reply',
      video: comment.video,
      comment: comment._id,
      message: `${req.user.channelName || req.user.name} replied to your comment`,
    });

    res.status(201).json({ success: true, data: reply });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Make sure user is comment owner or video owner or admin
    const video = await Video.findById(comment.video);

    if (
      comment.user.toString() !== req.user.id &&
      (!video || video.owner.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    // Decrement commentsCount in Video model
    if (video) {
      video.commentsCount = Math.max(0, video.commentsCount - 1);
      await video.save();
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
