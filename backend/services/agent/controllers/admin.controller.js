// backend/services/agent/controllers/admin.controller.js
import UserWallet from "../models/UserWallet.js";
import CreditTransaction from "../models/CreditTransaction.js";
import CreditPackage from "../models/CreditPackage.js";
import AIUsageRecord from "../models/AIUsageRecord.js";
import PaymentOrder from "../models/PaymentOrder.js";
import AdminAuditLog from "../models/AdminAuditLog.js";
import PricingConfig from "../models/PricingConfig.js";
import { ensureUserWallet } from "../utils/tokenAccounting.js";

/**
 * Middleware or helper to verify admin privileges
 */
const isAdminRequest = (req) => {
  const userRole = req.headers["x-user-role"] || req.user?.role;
  return userRole === "admin" || process.env.NODE_ENV !== "production";
};

/**
 * GET /api/admin/credits/users
 * Lists user wallets and credit balances
 */
export const getAdminUsers = async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin privileges required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [wallets, total] = await Promise.all([
      UserWallet.find().sort({ updatedAt: -1 }).skip(skip).limit(limit),
      UserWallet.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      users: wallets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/credits/transactions
 * Global credit transaction logs
 */
export const getAdminTransactions = async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin privileges required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      CreditTransaction.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      CreditTransaction.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error("Admin Get Transactions Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/credits/adjust
 * Manually adjusts a user's credit balance with an immutable audit log
 */
export const adjustUserCredits = async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin privileges required" });
    }

    const adminId = req.headers["x-user-id"] || "admin_system";
    const { targetUserId, amount, reason } = req.body;

    if (!targetUserId || typeof amount !== "number" || !reason) {
      return res.status(400).json({
        success: false,
        message: "targetUserId, numerical amount, and reason are required"
      });
    }

    const wallet = await ensureUserWallet(targetUserId);
    const balanceBefore = wallet.availableCredits;
    const balanceAfter = Math.max(0, balanceBefore + amount);

    wallet.availableCredits = balanceAfter;
    await wallet.save();

    // Create CreditTransaction
    const transaction = await CreditTransaction.create({
      userId: String(targetUserId),
      type: "admin_adjustment",
      amount,
      balanceBefore,
      balanceAfter,
      description: `Admin Adjustment: ${reason}`,
      referenceId: `admin_${adminId}`,
      status: "completed",
      metadata: { adminId, reason }
    });

    // Create AdminAuditLog
    await AdminAuditLog.create({
      adminId: String(adminId),
      adminEmail: req.user?.email || "admin@aivora.ai",
      action: "CREDIT_ADJUSTMENT",
      targetUserId: String(targetUserId),
      amountChanged: amount,
      reason,
      metadata: { balanceBefore, balanceAfter, transactionId: transaction._id }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully adjusted credits by ${amount > 0 ? "+" : ""}${amount} for user ${targetUserId}`,
      wallet: {
        userId: targetUserId,
        availableCredits: wallet.availableCredits,
        totalConsumedCredits: wallet.totalConsumedCredits
      }
    });

  } catch (error) {
    console.error("Admin Adjust Credits Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/credits/analytics
 * Overview of platform tokens, credits, revenue, and payments
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    if (!isAdminRequest(req)) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin privileges required" });
    }

    const [totalUsers, walletTotals, usageTotals, payments] = await Promise.all([
      UserWallet.countDocuments(),
      UserWallet.aggregate([
        {
          $group: {
            _id: null,
            totalAvailable: { $sum: "$availableCredits" },
            totalPurchased: { $sum: "$totalPurchasedCredits" },
            totalConsumed: { $sum: "$totalConsumedCredits" }
          }
        }
      ]),
      AIUsageRecord.aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: "$totalTokens" },
            totalRequests: { $sum: 1 }
          }
        }
      ]),
      PaymentOrder.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalPaidOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const auditLogs = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalAvailableCredits: walletTotals[0]?.totalAvailable || 0,
        totalPurchasedCredits: walletTotals[0]?.totalPurchased || 0,
        totalConsumedCredits: walletTotals[0]?.totalConsumed || 0,
        totalTokens: usageTotals[0]?.totalTokens || 0,
        totalRequests: usageTotals[0]?.totalRequests || 0,
        totalRevenueINR: payments[0]?.totalRevenue || 0,
        totalPaidOrders: payments[0]?.totalPaidOrders || 0,
        recentAuditLogs: auditLogs
      }
    });

  } catch (error) {
    console.error("Admin Analytics Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
