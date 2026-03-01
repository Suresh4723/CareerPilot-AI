import mongoose from 'mongoose';

const careerResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inputData: {
      skills: [String],
      interests: String,
      education: String,
      experienceLevel: String
    },
    aiResponse: {
      careers: [
        {
          title: String,
          reason: String,
          requiredSkills: [String],
          certifications: [String]
        }
      ]
    }
  },
  { timestamps: true }
);

export const CareerResult = mongoose.model('CareerResult', careerResultSchema);
