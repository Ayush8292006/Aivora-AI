import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import redis from "../../../shared/redis/redis.js"
import crypto from "crypto"

export const login = async (req, res) => {
    try {
        const { token } = req.body
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" })
        }

        const decoded = await getAuth(app).verifyIdToken(token)
        let user = await User.findOne({
            firebaseUid: decoded.uid
        })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionId = crypto.randomUUID()
        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }), "EX", 7 * 24 * 60 * 60)

        const isProd = process.env.NODE_ENV === "production"
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ success: false, message: `login error: ${error.message}` })
    }
}

export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.sessionId
        if (sessionId) {
            await redis.del(`session-${sessionId}`)
        }

        const isProd = process.env.NODE_ENV === "production"
        res.clearCookie("sessionId", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        })
        return res.status(200).json({ success: true, message: "logout successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: `logout error: ${error.message}` })
    }
}
