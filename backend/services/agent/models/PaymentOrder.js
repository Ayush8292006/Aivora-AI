import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema({
  orderId: {
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
  userEmail: {
    type: String,
    default: ""
  },
  userName: {
    type: String,
    default: ""
  },
  packageCode: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true // in INR
  },
  amountInPaise: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  credits: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed", "refunded"],
    default: "created",
    index: true
  },
  paymentId: {
    type: String,
    default: null,
    index: true
  },
  signature: {
    type: String,
    default: null
  },
  receipt: {
    type: String,
    default: null
  },
  errorDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  rawResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);
export default PaymentOrder;
