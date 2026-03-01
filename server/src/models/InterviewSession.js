import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    questions: [String],
    options: [[String]],
    answerKey: [String],
    answers: [String],
    feedback: [String],
    questionCount: {
      type: Number,
      default: 20
    },
    timeLimitMin: {
      type: Number,
      default: 20
    },
    totalScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
