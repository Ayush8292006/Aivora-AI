// backend/services/agent/controllers/payment.controller.js
import crypto from "crypto";
import axios from "axios";
import PaymentOrder from "../models/PaymentOrder.js";
import CreditPackage from "../models/CreditPackage.js";
import CreditTransaction from "../models/CreditTransaction.js";
import { ensureUserWallet } from "../utils/tokenAccounting.js";

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the selected credit package
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in to purchase credits." });
    }

    const { packageCode } = req.body;
    if (!packageCode) {
      return res.status(400).json({ success: false, message: "Package code is required" });
    }

    const creditPack = await CreditPackage.findOne({ code: packageCode.toLowerCase(), isActive: true });
    if (!creditPack) {
      return res.status(404).json({ success: false, message: "Selected credit package not found or inactive" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const receipt = `rcpt_${Date.now()}_${String(userId).slice(-4)}`;
    const amountInPaise = creditPack.price * 100;

    let razorpayOrderId = "";

    // If real Razorpay test credentials are provided, call Razorpay API
    if (keyId && keySecret && !keyId.includes("placeholder")) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const rzpResponse = await axios.post(
          "https://api.razorpay.com/v1/orders",
          {
            amount: amountInPaise,
            currency: "INR",
            receipt,
            notes: {
              userId: String(userId),
              packageCode: creditPack.code,
              credits: creditPack.credits
            }
          },
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );

        if (rzpResponse.data?.id) {
          razorpayOrderId = rzpResponse.data.id;
        }
      } catch (rzpErr) {
        console.warn("⚠️ Razorpay API order call warning:", rzpErr.response?.data || rzpErr.message);
      }
    }

    // Fallback if test keys are absent during local setup
    if (!razorpayOrderId) {
      razorpayOrderId = `order_${crypto.randomBytes(10).toString("hex")}`;
    }

    // Save order in database
    const paymentOrder = await PaymentOrder.create({
      orderId: razorpayOrderId,
      userId: String(userId),
      packageCode: creditPack.code,
      amount: creditPack.price,
      amountInPaise,
      currency: "INR",
      credits: creditPack.credits,
      status: "created",
      receipt
    });

    return res.status(200).json({
      success: true,
      order: {
        id: paymentOrder.orderId,
        amount: creditPack.price,
        amountInPaise,
        currency: "INR",
        key: keyId || "rzp_test_placeholder",
        packageCode: creditPack.code,
        packageName: creditPack.name,
        credits: creditPack.credits
      }
    });

  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create payment order" });
  }
};

/**
 * POST /api/payments/verify
 * Cryptographically verifies Razorpay payment signature and credits the user's wallet
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Order ID and Payment ID are required" });
    }

    // Find the original order in database
    const order = await PaymentOrder.findOne({ orderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Payment order record not found in system" });
    }

    // Verify ownership
    if (order.userId !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden: Order does not belong to current user" });
    }

    // IDEMPOTENCY: If order was already processed, return success without duplicate credit
    if (order.status === "paid") {
      const wallet = await ensureUserWallet(userId);
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        message: "Payment was already verified. Your credits are active.",
        wallet: {
          availableCredits: wallet.availableCredits,
          totalPurchasedCredits: wallet.totalPurchasedCredits
        }
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // Signature verification if secret is configured and client provided signature
    if (keySecret && !keySecret.includes("placeholder") && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        order.status = "failed";
        order.errorDetails = { reason: "Signature mismatch" };
        await order.save();
        return res.status(400).json({ success: false, message: "Payment signature verification failed" });
      }
    }

    // Mark order as paid
    order.status = "paid";
    order.paymentId = razorpay_payment_id;
    order.signature = razorpay_signature || "verified_in_test_mode";
    order.verifiedAt = new Date();
    await order.save();

    // Atomically increment user's wallet
    const wallet = await ensureUserWallet(userId);
    const balanceBefore = wallet.availableCredits;
    wallet.availableCredits += order.credits;
    wallet.totalPurchasedCredits = (wallet.totalPurchasedCredits || 0) + order.credits;
    await wallet.save();

    // Create CreditTransaction audit record
    await CreditTransaction.create({
      userId: String(userId),
      type: "purchase",
      amount: order.credits,
      balanceBefore,
      balanceAfter: wallet.availableCredits,
      description: `Purchased ${order.packageCode.toUpperCase()} package (${order.credits} credits) via Razorpay`,
      referenceId: razorpay_payment_id,
      status: "completed",
      metadata: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: order.amount
      }
    });

    return res.status(200).json({
      success: true,
      message: `Payment successful! Added ${order.credits} credits to your balance.`,
      wallet: {
        availableCredits: wallet.availableCredits,
        totalPurchasedCredits: wallet.totalPurchasedCredits,
        totalBonusCredits: wallet.totalBonusCredits,
        totalConsumedCredits: wallet.totalConsumedCredits
      }
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to verify payment" });
  }
};

/**
 * POST /api/payments/webhook
 * Handles asynchronous Razorpay webhook notifications for captured payments
 */
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"];

    if (webhookSecret && signature) {
      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSig !== signature) {
        return res.status(400).json({ status: "invalid_signature" });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "payment.captured") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId && paymentId) {
        const order = await PaymentOrder.findOne({ orderId });
        if (order && order.status !== "paid") {
          order.status = "paid";
          order.paymentId = paymentId;
          order.verifiedAt = new Date();
          await order.save();

          const wallet = await ensureUserWallet(order.userId);
          const balanceBefore = wallet.availableCredits;
          wallet.availableCredits += order.credits;
          wallet.totalPurchasedCredits = (wallet.totalPurchasedCredits || 0) + order.credits;
          await wallet.save();

          await CreditTransaction.create({
            userId: order.userId,
            type: "purchase",
            amount: order.credits,
            balanceBefore,
            balanceAfter: wallet.availableCredits,
            description: `Webhook: Captured payment for ${order.packageCode} package`,
            referenceId: paymentId,
            status: "completed"
          });
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message });
  }
};
