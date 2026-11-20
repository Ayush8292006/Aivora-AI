import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      "signup_bonus",
      "purchase",
      "ai_usage",
      "refund",
      "promo",
      "admin_adjustment"
    ],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: String,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ["completed", "pending", "failed", "reversed"],
    default: "completed",
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

creditTransactionSchema.index({ userId: 1, createdAt: -1 });

const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema);
export default CreditTransaction;
