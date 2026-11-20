import mongoose from "mongoose";

const pricingConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const PricingConfig = mongoose.model("PricingConfig", pricingConfigSchema);
export default PricingConfig;
