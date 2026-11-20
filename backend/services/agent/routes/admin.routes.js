// backend/services/agent/routes/admin.routes.js
import express from "express";
import {
  getAdminUsers,
  getAdminTransactions,
  adjustUserCredits,
  getAdminAnalytics
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", getAdminUsers);
router.get("/transactions", getAdminTransactions);
router.post("/adjust", adjustUserCredits);
router.get("/analytics", getAdminAnalytics);

export default router;
