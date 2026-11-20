import mongoose from "mongoose";

const guestSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  },
  questionsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  maxQuestions: {
    type: Number,
    default: 4
  },
  isConverted: {
    type: Boolean,
    default: false
  },
  convertedUserId: {
    type: String,
    default: null
  }
}, { timestamps: true });

const GuestSession = mongoose.model("GuestSession", guestSessionSchema);
export default GuestSession;
