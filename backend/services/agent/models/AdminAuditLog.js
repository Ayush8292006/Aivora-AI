import mongoose from "mongoose";

const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    index: true
  },
  adminEmail: {
    type: String,
    default: ""
  },
  action: {
    type: String,
    required: true
  },
  targetUserId: {
    type: String,
    required: true,
    index: true
  },
  amountChanged: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

adminAuditLogSchema.index({ targetUserId: 1, createdAt: -1 });

const AdminAuditLog = mongoose.model("AdminAuditLog", adminAuditLogSchema);
export default AdminAuditLog;
