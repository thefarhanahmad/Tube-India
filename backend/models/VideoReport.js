const mongoose = require('mongoose');

const videoReportSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.ObjectId,
    ref: 'Video',
    required: true,
  },
  reporter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Please add a report reason'],
    trim: true,
    maxlength: [500, 'Reason cannot be more than 500 characters'],
  },
  status: {
    type: String,
    enum: ['open', 'reviewed', 'dismissed', 'actioned'],
    default: 'open',
  },
  adminNote: {
    type: String,
    maxlength: [1000, 'Admin note cannot be more than 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

videoReportSchema.index({ video: 1, reporter: 1 }, { unique: true });
videoReportSchema.index({ status: 1, createdAt: -1 });

videoReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VideoReport', videoReportSchema);
