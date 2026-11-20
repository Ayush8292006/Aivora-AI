import mongoose from "mongoose";

const userWalletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  availableCredits: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  totalPurchasedCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBonusCredits: {
    type: Number,
    default: 100,
    min: 0
  },
  totalConsumedCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["active", "suspended", "locked"],
    default: "active"
  },
  isBonusAwarded: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const UserWallet = mongoose.model("UserWallet", userWalletSchema);
export default UserWallet;
