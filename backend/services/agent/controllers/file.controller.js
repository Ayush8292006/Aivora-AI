import File from "../models/file.model.js";
import storage from "../storage/storage.js";
import path from "path";
import pdfParse from "pdf-parse";

// Magic bytes validation
const checkMagicBytes = (buffer) => {
    if (!buffer || buffer.length < 4) return null;

    // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return { mime: "application/pdf", ext: "pdf", kind: "pdf" };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer.length >= 8 &&
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
        return { mime: "image/png", ext: "png", kind: "image" };
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return { mime: "image/jpeg", ext: "jpg", kind: "image" };
    }

    // WebP: RIFF ... WEBP
    if (buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return { mime: "image/webp", ext: "webp", kind: "image" };
    }

    return null;
};

export const uploadFile = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Missing user identity" });
        }

        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { conversationId } = req.body;
        const buffer = uploadedFile.buffer;

        // Magic bytes validation
        const verified = checkMagicBytes(buffer);
        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Only PDF and images (PNG, JPEG, WebP) are allowed."
            });
        }

        // File size validation: image <= 8MB, PDF <= 20MB
        const sizeInMb = buffer.length / (1024 * 1024);
        if (verified.kind === "image" && sizeInMb > 8) {
            return res.status(400).json({
                success: false,
                message: `Image exceeds maximum allowed size of 8 MB (current size: ${sizeInMb.toFixed(1)} MB)`
            });
        }
        if (verified.kind === "pdf" && sizeInMb > 20) {
            return res.status(400).json({
                success: false,
                message: `PDF exceeds maximum allowed size of 20 MB (current size: ${sizeInMb.toFixed(1)} MB)`
            });
        }

        // Save file through storage adapter
        const saved = await storage.save({
            userId,
            buffer,
            ext: verified.ext
        });

        // PDF text and page extraction if PDF
        let extractedText = "";
        let pageCount = 1;
        if (verified.kind === "pdf") {
            try {
                const pdfData = await pdfParse(buffer);
                extractedText = (pdfData.text || "").trim();
                pageCount = pdfData.numpages || 1;
            } catch (pdfErr) {
                console.warn("⚠️ pdf-parse warning:", pdfErr.message);
            }
        }

        // Clean file name
        const cleanName = path.basename(uploadedFile.originalname || `upload.${verified.ext}`)
            .replace(/[^\w\.\-\s]/gi, "");

        const fileDoc = await File.create({
            userId: String(userId),
            conversationId: conversationId || null,
            origin: "upload",
            kind: verified.kind,
            name: cleanName,
            mimeType: verified.mime,
            size: saved.size,
            path: saved.path,
            text: extractedText,
            pages: pageCount,
            meta: {
                originalName: uploadedFile.originalname,
                hasText: Boolean(extractedText && extractedText.length > 50)
            }
        });

        return res.status(201).json({
            success: true,
            file: {
                id: fileDoc._id,
                fileId: fileDoc._id,
                name: fileDoc.name,
                kind: fileDoc.kind,
                mimeType: fileDoc.mimeType,
                size: fileDoc.size,
                url: `/api/files/${fileDoc._id}`,
                pages: fileDoc.pages
            }
        });

    } catch (error) {
        console.error("Upload file error:", error);
        return res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
    }
};

export const getFile = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { id } = req.params;

        const fileDoc = await File.findById(id);
        if (!fileDoc) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        // Ownership check
        if (String(fileDoc.userId) !== String(userId)) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        const isDownload = req.query.download === "1";
        const disposition = isDownload ? "attachment" : "inline";
        const safeName = encodeURIComponent(fileDoc.name);

        res.setHeader("Content-Type", fileDoc.mimeType);
        res.setHeader("Content-Disposition", `${disposition}; filename*=UTF-8''${safeName}`);
        res.setHeader("Content-Length", fileDoc.size);

        const readStream = storage.read(fileDoc.path);
        readStream.on("error", (streamErr) => {
            console.error("Stream error:", streamErr);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Error streaming file" });
            }
        });

        readStream.pipe(res);

    } catch (error) {
        console.error("Get file error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { id } = req.params;

        const fileDoc = await File.findById(id);
        if (!fileDoc) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        // Ownership check
        if (String(fileDoc.userId) !== String(userId)) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        await storage.delete(fileDoc.path);
        await File.deleteOne({ _id: fileDoc._id });

        return res.status(200).json({ success: true, message: "File deleted successfully" });

    } catch (error) {
        console.error("Delete file error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
