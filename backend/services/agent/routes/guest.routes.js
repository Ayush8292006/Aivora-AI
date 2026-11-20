// backend/services/agent/routes/guest.routes.js
import express from "express";
import {
  initOrGetGuestSession,
  getGuestUsage,
  convertGuestToUser
} from "../controllers/guest.controller.js";

const router = express.Router();

router.post("/session", initOrGetGuestSession);
router.get("/usage", getGuestUsage);
router.post("/convert", convertGuestToUser);

export default router;
