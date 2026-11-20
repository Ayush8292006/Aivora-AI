import "dotenv/config"
import express from 'express'
import proxy from "express-http-proxy"
import cors from "cors"
import cookieParser from 'cookie-parser'
import { getCurrentUser } from './controllers/user.controller.js'
import protect from './middleware/auth.middleware.js'
import { proxyWithHeader } from './utils/proxyWithHeader.js'
import morgan from 'morgan'

const port = process.env.PORT || 8000
const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))
app.use(morgan("dev"))

app.use(cookieParser())
app.use("/api/auth", proxy(process.env.AUTH_SERVICE || "http://localhost:8001"))
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE || "http://localhost:8002"))
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE || "http://localhost:8003"))
app.get("/api/me", protect, getCurrentUser)

app.get("/", (req, res) => {
    res.json({ message: "hello from Gateway" })
})

app.listen(port, () => {
    console.log("Gateway Started at", port)
})
