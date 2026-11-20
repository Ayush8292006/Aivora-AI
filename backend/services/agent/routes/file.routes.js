import express from "express";
import multer from "multer";
import { uploadFile, getFile, deleteFile } from "../controllers/file.controller.js";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024 // 25 MB max before controller validation
    }
});

router.post("/upload", upload.single("file"), uploadFile);
router.get("/:id", getFile);
router.delete("/:id", deleteFile);

export default router;
