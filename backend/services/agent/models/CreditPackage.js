import mongoose from "mongoose";

const creditPackageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0 // Price in INR
  },
  credits: {
    type: Number,
    required: true,
    min: 1
  },
  badge: {
    type: String,
    default: ""
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ""
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const CreditPackage = mongoose.model("CreditPackage", creditPackageSchema);
export default CreditPackage;
