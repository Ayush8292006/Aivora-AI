// backend/services/agent/controllers/credit.controller.js
import UserWallet from "../models/UserWallet.js";
import CreditTransaction from "../models/CreditTransaction.js";
import CreditPackage from "../models/CreditPackage.js";
import AIUsageRecord from "../models/AIUsageRecord.js";
import ConversationUsage from "../models/ConversationUsage.js";
import { ensureUserWallet } from "../utils/tokenAccounting.js";

// Initial seed packages if database has none
const INITIAL_PACKAGES = [
  {
    code: "starter",
    name: "Starter",
    price: 49,
    credits: 500,
    badge: "Try Aivora AI",
    isRecommended: false,
    description: "Ideal for exploring models and testing code synthesis.",
    features: [
      "500 AI credits (~50,000 words)",
      "Access to all 8 AI modes",
      "Interactive code preview sandbox",
      "Executive PDF & resume exports"
    ],
    displayOrder: 1
  },
  {
    code: "basic",
    name: "Basic",
    price: 99,
    credits: 1200,
    badge: "Regular Usage",
    isRecommended: false,
    description: "Perfect for students, developers and regular researchers.",
    features: [
      "1,200 AI credits (~150,000 words)",
      "High-speed Groq & Gemini reasoning",
      "PowerPoint presentation exports",
      "Standard cloud history sync"
    ],
    displayOrder: 2
  },
  {
    code: "pro",
    name: "Pro",
    price: 199,
    credits: 3000,
    badge: "Recommended",
    isRecommended: true,
    description: "Most popular for professionals and power creators.",
    features: [
      "3,000 AI credits (~400,000 words)",
      "Priority multi-agent routing",
      "Unlimited code execution previews",
      "4K cinematic image synthesis",
      "Live web research with citations"
    ],
    displayOrder: 3
  },
  {
    code: "premium",
    name: "Premium",
    price: 499,
    credits: 9000,
    badge: "Maximum Value",
    isRecommended: false,
    description: "For heavy AI workflows, multi-document synthesis & teams.",
    features: [
      "9,000 AI credits (~1,200,000 words)",
      "DeepSeek reasoning models",
      "Highest priority execution queue",
      "Dedicated multi-modal file storage",
      "Zero rate limits on document parsing"
    ],
    displayOrder: 4
  }
];

/**
 * GET /api/credits/wallet
 * Returns current user's wallet with signup bonus auto-initialized if first time
 */
export const getWallet = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const wallet = await ensureUserWallet(userId);
    return res.status(200).json({
      success: true,
      wallet: {
        availableCredits: wallet.availableCredits,
        totalPurchasedCredits: wallet.totalPurchasedCredits,
        totalBonusCredits: wallet.totalBonusCredits,
        totalConsumedCredits: wallet.totalConsumedCredits,
        status: wallet.status
      }
    });
  } catch (error) {
    console.error("Get Wallet Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/packages
 * Returns all active purchasable credit packages (auto-seeds if empty)
 */
export const getPackages = async (req, res) => {
  try {
    let packages = await CreditPackage.find({ isActive: true }).sort({ displayOrder: 1 });

    if (!packages || packages.length === 0) {
      await CreditPackage.insertMany(INITIAL_PACKAGES);
      packages = await CreditPackage.find({ isActive: true }).sort({ displayOrder: 1 });
    }

    return res.status(200).json({
      success: true,
      packages
    });
  } catch (error) {
    console.error("Get Packages Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/transactions
 * Returns user's credit transactions with pagination
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      CreditTransaction.find({ userId: String(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CreditTransaction.countDocuments({ userId: String(userId) })
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
    console.error("Get Transactions Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/usage
 * Returns user aggregate AI usage metrics
 */
export const getUsageOverview = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const wallet = await ensureUserWallet(userId);

    const stats = await AIUsageRecord.aggregate([
      { $match: { userId: String(userId) } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalPromptTokens: { $sum: "$promptTokens" },
          totalCompletionTokens: { $sum: "$completionTokens" },
          totalTokens: { $sum: "$totalTokens" },
          totalCreditsConsumed: { $sum: "$creditsConsumed" }
        }
      }
    ]);

    const usage = stats[0] || {
      totalRequests: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      totalCreditsConsumed: 0
    };

    return res.status(200).json({
      success: true,
      wallet: {
        availableCredits: wallet.availableCredits,
        totalPurchasedCredits: wallet.totalPurchasedCredits,
        totalBonusCredits: wallet.totalBonusCredits,
        totalConsumedCredits: wallet.totalConsumedCredits
      },
      usage
    });
  } catch (error) {
    console.error("Get Usage Overview Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/usage/models
 * Returns model-wise breakdown of tokens and credits consumed
 */
export const getUsageByModel = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const modelBreakdown = await AIUsageRecord.aggregate([
      { $match: { userId: String(userId) } },
      {
        $group: {
          _id: "$model",
          requests: { $sum: 1 },
          totalTokens: { $sum: "$totalTokens" },
          creditsConsumed: { $sum: "$creditsConsumed" }
        }
      },
      { $sort: { creditsConsumed: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      models: modelBreakdown.map(m => ({
        model: m._id,
        requests: m.requests,
        totalTokens: m.totalTokens,
        creditsConsumed: m.creditsConsumed
      }))
    });
  } catch (error) {
    console.error("Get Usage By Model Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/usage/conversations
 * Returns recent conversation usage list
 */
export const getConversationUsageList = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const list = await ConversationUsage.find({ userId: String(userId) })
      .sort({ updatedAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      conversations: list
    });
  } catch (error) {
    console.error("Get Conversation Usage List Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/credits/usage/chat/:conversationId
 * Returns token and credit metrics for a single conversation
 */
export const getChatUsage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers["x-user-id"];

    const usage = await ConversationUsage.findOne({ conversationId: String(conversationId) });
    const wallet = userId ? await ensureUserWallet(userId) : null;

    return res.status(200).json({
      success: true,
      usage: usage || {
        conversationId,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalCreditsConsumed: 0,
        requestCount: 0,
        lastModelUsed: "Auto"
      },
      availableCredits: wallet ? wallet.availableCredits : 0
    });
  } catch (error) {
    console.error("Get Chat Usage Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
