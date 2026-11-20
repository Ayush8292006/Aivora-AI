import express from "express"
import { createConversation, getConversation, getMesaage, saveMesaage, updateConversation } from "../controllers/chat.controller.js"

const router = express.Router()

router.get("/create-conversation",createConversation)
router.get("/get-conversation",getConversation)
router.post("/save-message",saveMesaage)
router.get("/get-messages/:conversationId",getMesaage)
router.post("/update-conversation",updateConversation)

export default router