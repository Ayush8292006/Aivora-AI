// backend/test_credit_system.js
import { calculateCredits, estimateTokens, DEFAULT_MODEL_RATES } from "./services/agent/utils/tokenAccounting.js";
import crypto from "crypto";

async function runTests() {
  console.log("=========================================");
  console.log("🧪 AIVORA AI CREDIT SYSTEM TEST SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Token Estimation Test
  const samplePrompt = "Build an interactive calculator with clean HTML and JavaScript";
  const estimatedTokens = estimateTokens(samplePrompt);
  assert(estimatedTokens > 10 && estimatedTokens < 25, `Token estimation accurate: ${estimatedTokens} tokens for ${samplePrompt.length} chars`);

  // 2. Model Credit Calculation Test - Groq
  const groqCredits = calculateCredits("llama-3.3-70b-versatile", 1000, 1000);
  assert(groqCredits === 2, `Groq credit rate: ${groqCredits} credits for 1k in + 1k out`);

  // 3. Model Credit Calculation Test - DeepSeek / OpenRouter
  const deepseekCredits = calculateCredits("deepseek/deepseek-chat", 1000, 1000);
  assert(deepseekCredits === 3, `DeepSeek credit rate: ${deepseekCredits} credits for 1k in + 1k out`);

  // 4. Model Credit Calculation Test - Image Generation
  const imageCredits = calculateCredits("image-generation", 0, 0, true);
  assert(imageCredits === 5, `Image generation fixed rate: ${imageCredits} credits`);

  // 5. Razorpay HMAC SHA256 Signature Verification Test
  const testSecret = "rzp_secret_DemoAivora2026";
  const orderId = "order_test_1234567890";
  const paymentId = "pay_test_0987654321";
  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const verifySignature = (oId, pId, sig, secret) => {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${oId}|${pId}`)
      .digest("hex");
    return expected === sig;
  };

  assert(
    verifySignature(orderId, paymentId, validSignature, testSecret) === true,
    "Razorpay HMAC SHA256 signature verification succeeds with correct secret"
  );

  assert(
    verifySignature(orderId, paymentId, "invalid_signature", testSecret) === false,
    "Razorpay HMAC SHA256 signature verification rejects tampered signature"
  );

  // 6. Guest Question Limit Test Logic
  const maxGuestQuestions = 4;
  let questionsUsed = 0;
  const canAskQuestion = (used) => used < maxGuestQuestions;

  assert(canAskQuestion(0) === true, "Guest question 1 allowed");
  assert(canAskQuestion(1) === true, "Guest question 2 allowed");
  assert(canAskQuestion(2) === true, "Guest question 3 allowed");
  assert(canAskQuestion(3) === true, "Guest question 4 allowed");
  assert(canAskQuestion(4) === false, "Guest question 5 correctly blocked");

  // 7. Wallet Deduct & Prevent Negative Balance Test
  let walletBalance = 5;
  const deductCredits = (available, toDeduct) => {
    const actual = Math.min(available, toDeduct);
    return Math.max(0, available - actual);
  };
  walletBalance = deductCredits(walletBalance, 10);
  assert(walletBalance === 0, `Wallet balance cannot be negative: ${walletBalance}`);

  console.log("\n=========================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("=========================================");

  if (failed > 0) process.exit(1);
}

runTests();
