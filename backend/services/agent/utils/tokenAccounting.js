// backend/services/agent/utils/tokenAccounting.js
import UserWallet from "../models/UserWallet.js";
import CreditTransaction from "../models/CreditTransaction.js";
import AIUsageRecord from "../models/AIUsageRecord.js";
import ConversationUsage from "../models/ConversationUsage.js";
import PricingConfig from "../models/PricingConfig.js";

// Default Model Token Rates (Credits per 1,000 tokens)
export const DEFAULT_MODEL_RATES = {
  "openai/gpt-oss-120b": { inputRate: 0.5, outputRate: 1.0, minCredits: 1 },
  "llama-3.3-70b-versatile": { inputRate: 0.5, outputRate: 1.0, minCredits: 1 },
  "deepseek/deepseek-chat": { inputRate: 1.0, outputRate: 2.0, minCredits: 1 },
  "gemini-2.5-flash": { inputRate: 0.8, outputRate: 1.5, minCredits: 1 },
  "image-generation": { fixedCredits: 5 },
  "default": { inputRate: 0.6, outputRate: 1.2, minCredits: 1 }
};

/**
 * Ensure a user has an active wallet with the signup bonus
 */
export async function ensureUserWallet(userId) {
  if (!userId) return null;
  let wallet = await UserWallet.findOne({ userId: String(userId) });
  if (!wallet) {
    const signupBonus = 100;
    wallet = await UserWallet.create({
      userId: String(userId),
      availableCredits: signupBonus,
      totalPurchasedCredits: 0,
      totalBonusCredits: signupBonus,
      totalConsumedCredits: 0,
      status: "active",
      isBonusAwarded: true
    });

    await CreditTransaction.create({
      userId: String(userId),
      type: "signup_bonus",
      amount: signupBonus,
      balanceBefore: 0,
      balanceAfter: signupBonus,
      description: "Welcome signup bonus for new Aivora AI account",
      referenceId: `bonus_${userId}`,
      status: "completed"
    });
  }
  return wallet;
}

/**
 * Check if the user has sufficient credits to initiate an AI request
 */
export async function checkCreditBalance(userId, minCreditsRequired = 1) {
  const wallet = await ensureUserWallet(userId);
  if (!wallet) return { allowed: false, availableCredits: 0, reason: "No wallet found" };

  if (wallet.status !== "active") {
    return { allowed: false, availableCredits: wallet.availableCredits, reason: "Wallet is suspended or locked" };
  }

  if (wallet.availableCredits < minCreditsRequired) {
    return {
      allowed: false,
      availableCredits: wallet.availableCredits,
      reason: "Insufficient credits. Please purchase a credit pack to continue."
    };
  }

  return { allowed: true, availableCredits: wallet.availableCredits };
}

/**
 * Estimate tokens based on standard character ratio (1 token ~ 4 characters)
 */
export function estimateTokens(text = "") {
  if (!text || typeof text !== "string") return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Calculate credits to consume based on input and output tokens
 */
export function calculateCredits(model = "default", inputTokens = 0, outputTokens = 0, isImage = false) {
  if (isImage) {
    return DEFAULT_MODEL_RATES["image-generation"].fixedCredits;
  }

  const rates = DEFAULT_MODEL_RATES[model] || DEFAULT_MODEL_RATES["default"];
  const inputCost = (inputTokens / 1000) * rates.inputRate;
  const outputCost = (outputTokens / 1000) * rates.outputRate;
  const total = Math.ceil(inputCost + outputCost);

  return Math.max(rates.minCredits || 1, total);
}

/**
 * Settle AI usage: deduct credits atomically, log transaction, update conversation usage
 */
export async function settleAIUsage({
  userId,
  conversationId,
  model = "default",
  agentMode = "auto",
  promptText = "",
  responseText = "",
  usageMetadata = null,
  isImage = false
}) {
  if (!userId) return null;

  // Determine actual or estimated token counts
  let promptTokens = 0;
  let completionTokens = 0;
  let isEstimated = false;

  if (usageMetadata && (usageMetadata.input_tokens || usageMetadata.output_tokens || usageMetadata.prompt_tokens)) {
    promptTokens = usageMetadata.input_tokens || usageMetadata.prompt_tokens || 0;
    completionTokens = usageMetadata.output_tokens || usageMetadata.completion_tokens || 0;
  } else {
    promptTokens = estimateTokens(promptText);
    completionTokens = estimateTokens(responseText);
    isEstimated = true;
  }

  const totalTokens = promptTokens + completionTokens;
  const creditsToDeduct = calculateCredits(model, promptTokens, completionTokens, isImage);

  // Atomically deduct credits from user's wallet
  const wallet = await ensureUserWallet(userId);
  const balanceBefore = wallet.availableCredits;
  const actualDeduction = Math.min(balanceBefore, creditsToDeduct);
  const balanceAfter = Math.max(0, balanceBefore - actualDeduction);

  wallet.availableCredits = balanceAfter;
  wallet.totalConsumedCredits = (wallet.totalConsumedCredits || 0) + actualDeduction;
  await wallet.save();

  // Create credit transaction record
  const transaction = await CreditTransaction.create({
    userId: String(userId),
    type: "ai_usage",
    amount: -actualDeduction,
    balanceBefore,
    balanceAfter,
    description: `AI request using ${model} (${agentMode} mode)`,
    referenceId: conversationId,
    status: "completed",
    metadata: {
      model,
      agentMode,
      promptTokens,
      completionTokens,
      totalTokens,
      isEstimated
    }
  });

  // Create detailed AI usage record
  const usageRecord = await AIUsageRecord.create({
    userId: String(userId),
    conversationId: String(conversationId),
    model,
    agentMode,
    promptTokens,
    completionTokens,
    totalTokens,
    creditsConsumed: actualDeduction,
    isEstimated,
    status: "settled"
  });

  // Update or create ConversationUsage summary
  await ConversationUsage.findOneAndUpdate(
    { conversationId: String(conversationId) },
    {
      $setOnInsert: { userId: String(userId) },
      $inc: {
        totalInputTokens: promptTokens,
        totalOutputTokens: completionTokens,
        totalTokens: totalTokens,
        totalCreditsConsumed: actualDeduction,
        requestCount: 1
      },
      $set: {
        lastModelUsed: model
      }
    },
    { upsert: true, new: true }
  );

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    creditsConsumed: actualDeduction,
    availableCredits: balanceAfter,
    isEstimated,
    transactionId: transaction._id
  };
}
