import Conversation from "../models/conversation.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.create({
      userId,
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

    const conversations = await Conversation.find({
      userId,
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
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Get Conversation By Id Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

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
    const { id } = req.params;
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
    const { conversationId, role, content, images, artifacts, attachments } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts,
      attachments
    });

    // Touch conversation updatedAt
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

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
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get Message Error:", error);

    return res.status(500).json({
      message: `Get message error: ${error.message}`,
    });
  }
};
