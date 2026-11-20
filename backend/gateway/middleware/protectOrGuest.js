// backend/gateway/middleware/protectOrGuest.js
import redis from "../../shared/redis/redis.js";
import crypto from "crypto";

const protectOrGuest = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            const session = await redis.get(`session-${sessionId}`);
            if (session) {
                req.user = JSON.parse(session);
                return next();
            }
        }

        // Check for guest identifier
        let guestSessionId = req.headers["x-guest-session-id"] || req.cookies?.guestSessionId;
        if (!guestSessionId) {
            guestSessionId = `guest_${crypto.randomUUID()}`;
            const isProd = process.env.NODE_ENV === "production";
            res.cookie("guestSessionId", guestSessionId, {
                httpOnly: false,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
        }

        req.user = {
            userId: guestSessionId,
            _id: guestSessionId,
            name: "Guest User",
            email: "guest@aivora.ai",
            role: "guest",
            isGuest: true
        };

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: `protectOrGuest error: ${error.message}` });
    }
};

export default protectOrGuest;
