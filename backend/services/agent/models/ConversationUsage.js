import mongoose from "mongoose";

const conversationUsageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  totalInputTokens: {
    type: Number,
    default: 0
  },
  totalOutputTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  totalCreditsConsumed: {
    type: Number,
    default: 0
  },
  requestCount: {
    type: Number,
    default: 0
  },
  lastModelUsed: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const ConversationUsage = mongoose.model("ConversationUsage", conversationUsageSchema);
export default ConversationUsage;
