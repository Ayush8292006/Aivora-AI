import Conversation from "../models/conversation.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    console.log("UserId:", userId);

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

    console.log("UserId:", userId);

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });
    console.log("Headers:", req.headers);
console.log("UserId:", req.headers["x-user-id"]);

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get Conversation Error:", error);

    return res.status(500).json({
      message: `Get conversation error: ${error.message}`,
    });
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

export const saveMesaage = async (req, res) => {
  try {
    const { conversationId, role, content, images,artifacts } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts
    });

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
    })

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get Message Error:", error);

    return res.status(500).json({
      message: `Get message error: ${error.message}`,
    });
  }
};