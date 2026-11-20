import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    conversationId: {
        type: String,
        index: true
    },
    origin: {
        type: String,
        enum: ["upload", "generated"],
        default: "upload"
    },
    kind: {
        type: String,
        enum: ["pdf", "ppt", "image"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    pages: {
        type: Number
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

fileSchema.index({ userId: 1, createdAt: -1 });

const File = mongoose.model("File", fileSchema);
export default File;
