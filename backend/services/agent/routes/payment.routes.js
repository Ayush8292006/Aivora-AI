// backend/services/agent/routes/payment.routes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
