// backend/services/agent/controllers/guest.controller.js
import crypto from "crypto";
import GuestSession from "../models/GuestSession.js";

/**
 * POST /api/guest/session
 * Initializes or restores a persistent guest session
 */
export const initOrGetGuestSession = async (req, res) => {
  try {
    let sessionId = req.headers["x-guest-session-id"] || req.cookies?.guestSessionId;

    let guestSession = null;
    if (sessionId) {
      guestSession = await GuestSession.findOne({ sessionId });
    }

    if (!guestSession) {
      sessionId = `guest_${crypto.randomUUID()}`;
      guestSession = await GuestSession.create({
        sessionId,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "",
        questionsUsed: 0,
        maxQuestions: 4
      });
    }

    const questionsUsed = guestSession.questionsUsed || 0;
    const maxQuestions = guestSession.maxQuestions || 4;
    const questionsRemaining = Math.max(0, maxQuestions - questionsUsed);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("guestSessionId", sessionId, {
      httpOnly: false, // Accessible by frontend to attach to headers
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.status(200).json({
      success: true,
      guestSession: {
        sessionId,
        questionsUsed,
        maxQuestions,
        questionsRemaining,
        canChat: questionsUsed < maxQuestions
      }
    });

  } catch (error) {
    console.error("Guest session error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/guest/usage
 * Returns current usage for a guest session
 */
export const getGuestUsage = async (req, res) => {
  try {
    const sessionId = req.headers["x-guest-session-id"] || req.cookies?.guestSessionId;
    if (!sessionId) {
      return res.status(200).json({
        success: true,
        guestSession: {
          sessionId: null,
          questionsUsed: 0,
          maxQuestions: 4,
          questionsRemaining: 4,
          canChat: true
        }
      });
    }

    const guestSession = await GuestSession.findOne({ sessionId });
    if (!guestSession) {
      return res.status(200).json({
        success: true,
        guestSession: {
          sessionId,
          questionsUsed: 0,
          maxQuestions: 4,
          questionsRemaining: 4,
          canChat: true
        }
      });
    }

    const questionsUsed = guestSession.questionsUsed || 0;
    const maxQuestions = guestSession.maxQuestions || 4;

    return res.status(200).json({
      success: true,
      guestSession: {
        sessionId: guestSession.sessionId,
        questionsUsed,
        maxQuestions,
        questionsRemaining: Math.max(0, maxQuestions - questionsUsed),
        canChat: questionsUsed < maxQuestions
      }
    });

  } catch (error) {
    console.error("Get guest usage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/guest/convert
 * Links guest conversation/session to an authenticated user upon registration/login
 */
export const convertGuestToUser = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { guestSessionId } = req.body;

    if (userId && guestSessionId) {
      await GuestSession.findOneAndUpdate(
        { sessionId: guestSessionId },
        { isConverted: true, convertedUserId: String(userId) }
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Convert guest error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
