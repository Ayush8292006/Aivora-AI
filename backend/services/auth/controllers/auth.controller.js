import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import crypto from "crypto";

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
};

const verifyPassword = (password, storedHash) => {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, key] = storedHash.split(":");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
};

const setSessionAndCookie = async (res, user) => {
    const sessionId = crypto.randomUUID();
    await redis.set(
        `session-${sessionId}`,
        JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role || "user"
        }),
        "EX",
        7 * 24 * 60 * 60
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return sessionId;
};

// 1. Google OAuth Login
export const login = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const decoded = await getAuth(app).verifyIdToken(token);
        let user = await User.findOne({
            $or: [{ firebaseUid: decoded.uid }, { email: decoded.email?.toLowerCase() }]
        });

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name || decoded.email?.split("@")[0] || "Aivora User",
                email: decoded.email?.toLowerCase(),
                avatar: decoded.picture || "",
                role: "user",
                isEmailVerified: true
            });
        } else if (!user.firebaseUid) {
            user.firebaseUid = decoded.uid;
            if (decoded.picture && !user.avatar) user.avatar = decoded.picture;
            await user.save();
        }

        user.lastLoginAt = new Date();
        await user.save();

        await setSessionAndCookie(res, user);

        return res.status(200).json(user);
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({ success: false, message: `Login error: ${error.message}` });
    }
};

// 2. Email & Password Registration
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const passwordHash = hashPassword(password);
        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            passwordHash,
            role: "user",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            isEmailVerified: true
        });

        await setSessionAndCookie(res, user);

        return res.status(201).json(user);
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: `Registration error: ${error.message}` });
    }
};

// 3. Email & Password Login
export const loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = verifyPassword(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        user.lastLoginAt = new Date();
        await user.save();

        await setSessionAndCookie(res, user);

        return res.status(200).json(user);
    } catch (error) {
        console.error("Password Login Error:", error);
        return res.status(500).json({ success: false, message: `Login error: ${error.message}` });
    }
};

// 4. Logout
export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            await redis.del(`session-${sessionId}`);
        }

        const isProd = process.env.NODE_ENV === "production";
        res.clearCookie("sessionId", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Logout error: ${error.message}` });
    }
};
