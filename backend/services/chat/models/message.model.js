import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name: String,
    content: String
}, {
    _id: false
});

const artifactSchema = new mongoose.Schema({
    id: Number,
    type: String, // "Project" | "pdf" | "ppt" | "image"
    title: String,
    files: [fileSchema], // for "Project"
    fileId: String,
    url: String,
    mimeType: String,
    size: Number,
    meta: mongoose.Schema.Types.Mixed, // ppt slides, pdf pages/docType, image prompt/model
    version: {
        type: Number,
        default: 1
    },
    parentId: Number
}, {
    _id: false
});

const attachmentSchema = new mongoose.Schema({
    fileId: String,
    name: String,
    kind: String, // "pdf" | "image"
    mimeType: String,
    size: Number
}, {
    _id: false
});

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    role: {
        type: String,
        enum: ["user", "assistant"]
    },
    content: String,
    images: [String],
    artifacts: [artifactSchema],
    attachments: [attachmentSchema]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
