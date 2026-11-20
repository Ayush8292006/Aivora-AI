import express from "express"
import { 
  createConversation, 
  deleteConversation, 
  getConversation, 
  getConversationById, 
  getMesaage, 
  saveMesaage, 
  updateConversation, 
  linkGuestConversations,
  adoptConversation
} from "../controllers/chat.controller.js"

const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversation", getConversation)
router.get("/conversation/:id", getConversationById)
router.post("/conversation/adopt", adoptConversation)
router.delete("/conversation/:id", deleteConversation)
router.post("/save-message", saveMesaage)
router.get("/get-messages/:conversationId", getMesaage)
router.post("/update-conversation", updateConversation)
router.post("/link-guest", linkGuestConversations)

export default router
