import mongoose from "mongoose";

const aiUsageRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  messageId: {
    type: String,
    default: null
  },
  model: {
    type: String,
    required: true
  },
  agentMode: {
    type: String,
    default: "auto"
  },
  promptTokens: {
    type: Number,
    default: 0
  },
  completionTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  creditsConsumed: {
    type: Number,
    required: true,
    default: 0
  },
  isEstimated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["reserved", "settled", "refunded", "failed"],
    default: "settled"
  },
  error: {
    type: String,
    default: null
  }
}, { timestamps: true });

aiUsageRecordSchema.index({ userId: 1, createdAt: -1 });
aiUsageRecordSchema.index({ conversationId: 1, createdAt: -1 });

const AIUsageRecord = mongoose.model("AIUsageRecord", aiUsageRecordSchema);
export default AIUsageRecord;
