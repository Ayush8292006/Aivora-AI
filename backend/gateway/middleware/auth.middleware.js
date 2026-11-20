import redis from "../../shared/redis/redis.js"

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"]
        const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
        const sessionId = req.cookies?.sessionId || bearerToken

        if (!sessionId) {
            return res.status(401).json({ success: false, message: "unauthorized" })
        }
        const session = await redis.get(`session-${sessionId}`)
        if (!session) {
            return res.status(401).json({ success: false, message: "session expired" })
        }
        req.user = JSON.parse(session)
        req.user.isGuest = false
        next()
    } catch (error) {
        return res.status(500).json({ success: false, message: `protect error: ${error.message}` })
    }
}

export default protect
