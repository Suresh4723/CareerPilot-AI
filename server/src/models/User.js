import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user']
    },
    targetRole: {
      type: String,
      default: ''
    },
    experienceLevel: {
      type: String,
      default: ''
    },
    currentLevel: {
      type: String,
      default: ''
    },
    weeklyHours: {
      type: Number,
      default: 10
    },
    preferredLearningStyle: {
      type: String,
      default: 'mixed'
    },
    careerGoal: {
      type: String,
      default: '',
      maxlength: 500
    },
    skills: {
      type: [String],
      default: []
    },
    focusAreas: {
      type: [String],
      default: []
    },
    targetCompanies: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
