import "dotenv/config";
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controllers/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import protectOrGuest from "./middleware/protectOrGuest.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";

const port = process.env.PORT || 8000;
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(u => u.trim().replace(/\/$/, "")) : [])
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            allowedOrigins.some(ao => origin.startsWith(ao))
        ) {
            return callback(null, origin);
        }
        return callback(null, origin);
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"]
}));
app.use(morgan("dev"));
app.use(cookieParser());

const authService = process.env.AUTH_SERVICE || "http://localhost:8001";
const chatService = process.env.CHAT_SERVICE || "http://localhost:8002";
const agentService = process.env.AGENT_SERVICE || "http://localhost:8003";

// 1. Authentication Service
app.use("/api/auth", proxy(authService));

// 2. Chat Service (Supports both authenticated users and guests)
app.use("/api/chat", protectOrGuest, proxyWithHeader(chatService));

// 3. Agent & Multi-Model Service (Supports both authenticated users and guests)
app.use("/api/agent", protectOrGuest, proxyWithHeader(agentService));

// 4. Files Service
app.use("/api/files", protectOrGuest, proxyWithHeader(agentService, {
    proxyReqPathResolver: (req) => {
        return "/files" + req.url;
    },
    parseReqBody: false
}));

// 5. Credit & Usage Service
app.use("/api/credits", protectOrGuest, proxyWithHeader(agentService, {
    proxyReqPathResolver: (req) => {
        return "/credits" + req.url;
    }
}));

// 6. Payment & Razorpay Service
app.use("/api/payments", protect, proxyWithHeader(agentService, {
    proxyReqPathResolver: (req) => {
        return "/payments" + req.url;
    }
}));

// 7. Guest Session Management
app.use("/api/guest", protectOrGuest, proxyWithHeader(agentService, {
    proxyReqPathResolver: (req) => {
        return "/guest" + req.url;
    }
}));

// 8. Admin Management
app.use("/api/admin/credits", protect, proxyWithHeader(agentService, {
    proxyReqPathResolver: (req) => {
        return "/admin/credits" + req.url;
    }
}));

// Current user profile check
app.get("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
    res.json({ message: "hello from Aivora AI API Gateway" });
});

app.listen(port, () => {
    console.log("Aivora Gateway Started at", port);
});
