const mongoose = require('mongoose');

const practiceSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Question reference is required'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    timeTaken: {
      type: Number, // seconds
      required: [true, 'Time taken is required'],
      min: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    matchedConcepts: {
      type: [String],
      default: [],
    },
    totalConcepts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Practice', practiceSchema);
