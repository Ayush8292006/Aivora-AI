// backend/services/agent/routes/credit.routes.js
import express from "express";
import {
  getWallet,
  getPackages,
  getTransactions,
  getUsageOverview,
  getUsageByModel,
  getConversationUsageList,
  getChatUsage
} from "../controllers/credit.controller.js";

const router = express.Router();

router.get("/wallet", getWallet);
router.get("/packages", getPackages);
router.get("/transactions", getTransactions);
router.get("/usage", getUsageOverview);
router.get("/usage/models", getUsageByModel);
router.get("/usage/conversations", getConversationUsageList);
router.get("/usage/chat/:conversationId", getChatUsage);

export default router;
