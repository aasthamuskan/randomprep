const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
    },
    subTopic: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    description: {
      type: String,
      default: '',
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    expectedConcepts: {
      type: [String],
      default: [],
    },
    idealAnswer: {
      type: String,
      default: '',
    },
    hints: {
      type: [String],
      default: [],
    },
    questionNumber: {
      type: Number,
      default: 1,
    },
    references: [
      {
        title: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

// Middleware to sync category and subject for backward compatibility
questionSchema.pre('save', function (next) {
  if (this.subject && !this.category) {
    this.category = this.subject;
  } else if (this.category && !this.subject) {
    this.subject = this.category;
  }
  next();
});

// Text & Compound index for fast subject/subTopic filtering and search
questionSchema.index({ question: 'text', subject: 1, subTopic: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
