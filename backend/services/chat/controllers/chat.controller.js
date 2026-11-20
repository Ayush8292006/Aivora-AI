import Conversation from "../models/conversation.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User identifier required" });
    }

    const conversation = await Conversation.create({
      userId: String(userId),
      title: "New Chat"
    });

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Create Conversation Error:", error);
    return res.status(500).json({
      message: `Create conversation error: ${error.message}`,
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(200).json([]);
    }

    // Strict user isolation: Only return conversations belonging to this authenticated user or guest session
    const conversations = await Conversation.find({
      userId: String(userId),
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get Conversation Error:", error);
    return res.status(500).json({
      message: `Get conversation error: ${error.message}`,
    });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Strict isolation: if owned by a registered user, prevent other users from accessing it
    const convUserId = conversation.userId ? String(conversation.userId) : "";
    if (userId && convUserId && !convUserId.startsWith("guest_") && convUserId !== String(userId)) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this conversation" });
    }
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Get Conversation By Id Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const adoptConversation = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    if (!conversationId || !userId) {
      return res.status(400).json({ success: false, message: "Missing conversationId or userId" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const convUserId = conversation.userId ? String(conversation.userId) : "";
    // Allow adopting guest or unowned conversations
    if (!convUserId || convUserId.startsWith("guest_") || convUserId === "undefined" || convUserId === String(userId)) {
      conversation.userId = String(userId);
      await conversation.save();
      return res.status(200).json({ success: true, conversation });
    }

    return res.status(403).json({ success: false, message: "Cannot adopt another user's conversation" });
  } catch (err) {
    console.error("Adopt Conversation Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id, title } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const convUserId = conversation.userId ? String(conversation.userId) : "";
    // If guest conversation, allow logged-in user to claim it
    if (convUserId && !convUserId.startsWith("guest_") && userId && convUserId !== String(userId)) {
      return res.status(403).json({ message: "Forbidden: You cannot modify another user's conversation" });
    }

    if (userId && (!convUserId || convUserId.startsWith("guest_"))) {
      conversation.userId = String(userId);
    }
    conversation.title = title;
    await conversation.save();

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Update Conversation Error:", error);
    return res.status(500).json({
      message: `Update conversation error: ${error.message}`,
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const convUserId = conversation.userId ? String(conversation.userId) : "";
    if (convUserId && !convUserId.startsWith("guest_") && userId && convUserId !== String(userId)) {
      return res.status(403).json({ message: "Forbidden: You cannot delete another user's conversation" });
    }

    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
    return res.status(200).json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    return res.status(500).json({
      message: `Delete conversation error: ${error.message}`,
    });
  }
};

export const saveMesaage = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { conversationId, role, content, images, artifacts, attachments } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const convUserId = conversation.userId ? String(conversation.userId) : "";
      if (convUserId && !convUserId.startsWith("guest_") && userId && convUserId !== String(userId)) {
        return res.status(403).json({ message: "Forbidden: You cannot send messages in another user's conversation" });
      }
      if (userId && (!convUserId || convUserId.startsWith("guest_"))) {
        conversation.userId = String(userId);
      }
    }

    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts,
      attachments
    });

    if (conversation) {
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    return res.status(200).json(message);
  } catch (error) {
    console.error("Save Message Error:", error);
    return res.status(500).json({
      message: `Save message error: ${error.message}`,
    });
  }
};

export const getMesaage = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Strict conversation isolation: Disallow viewing another registered user's messages
    const convUserId = conversation.userId ? String(conversation.userId) : "";
    if (convUserId && !convUserId.startsWith("guest_") && userId && convUserId !== String(userId)) {
      return res.status(403).json({ message: "Forbidden: You do not have access to view this conversation's messages" });
    }

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get Message Error:", error);
    return res.status(500).json({
      message: `Get message error: ${error.message}`,
    });
  }
};

export const linkGuestConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { guestUserId, conversationId } = req.body;
    if (userId) {
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, { userId: String(userId) });
      }
      if (guestUserId && String(userId) !== String(guestUserId)) {
        await Conversation.updateMany(
          { $or: [{ userId: String(guestUserId) }, { userId: { $exists: false } }, { userId: null }, { userId: "undefined" }] },
          { userId: String(userId) }
        );
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Link Guest Conversations Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
