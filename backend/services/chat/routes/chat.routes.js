import express from "express"
import { createConversation, deleteConversation, getConversation, getConversationById, getMesaage, saveMesaage, updateConversation } from "../controllers/chat.controller.js"

const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversation", getConversation)
router.get("/conversation/:id", getConversationById)
router.delete("/conversation/:id", deleteConversation)
router.post("/save-message", saveMesaage)
router.get("/get-messages/:conversationId", getMesaage)
router.post("/update-conversation", updateConversation)

export default router
