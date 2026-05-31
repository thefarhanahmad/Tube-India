const mongoose = require('mongoose');

const videoViewSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.ObjectId,
    ref: 'Video',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  deviceId: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

videoViewSchema.index(
  { video: 1, user: 1 },
  { unique: true, partialFilterExpression: { user: { $exists: true } } },
);
videoViewSchema.index(
  { video: 1, deviceId: 1 },
  { unique: true, partialFilterExpression: { deviceId: { $exists: true, $type: 'string' } } },
);

module.exports = mongoose.model('VideoView', videoViewSchema);
