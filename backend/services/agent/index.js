import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import agentRouter from "./routes/agent.route.js";
import fileRouter from "./routes/file.routes.js";
import creditRouter from "./routes/credit.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import guestRouter from "./routes/guest.routes.js";
import adminRouter from "./routes/admin.routes.js";
import storage from "./storage/storage.js";

const port = process.env.PORT || 8003;
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/files", fileRouter);
app.use("/credits", creditRouter);
app.use("/payments", paymentRouter);
app.use("/guest", guestRouter);
app.use("/admin/credits", adminRouter);
app.use("/", agentRouter);

app.get("/", (req, res) => {
    res.json({ message: "hello from Agent & Credit Service" });
});

// Catch unhandled errors gracefully so process never dies silently
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Rejection in Agent Service:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("⚠️ Uncaught Exception in Agent Service:", err);
});

app.listen(port, "0.0.0.0", () => {
    console.log("Agent & Credit Service Started at", port);
    connectDb();

    // Run storage cleanup daily
    const retentionDays = parseInt(process.env.FILE_RETENTION_DAYS || "7", 10);
    storage.cleanup(retentionDays).catch(() => {});
    setInterval(() => {
        storage.cleanup(retentionDays).catch(() => {});
    }, 24 * 60 * 60 * 1000);
});
