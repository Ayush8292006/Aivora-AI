import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const baseStorageDir = process.env.STORAGE_DIR 
    ? path.resolve(process.env.STORAGE_DIR)
    : path.resolve(process.cwd(), "storage");

// Ensure base storage directory exists
if (!fs.existsSync(baseStorageDir)) {
    fs.mkdirSync(baseStorageDir, { recursive: true });
}

export const storage = {
    /**
     * Save a buffer or stream to disk
     */
    async save({ userId, buffer, ext = "bin" }) {
        if (!userId) throw new Error("userId is required for storage");
        const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
        const userDir = path.join(baseStorageDir, String(userId));
        
        await fs.promises.mkdir(userDir, { recursive: true });

        const filename = `${uuidv4()}.${sanitizedExt}`;
        const targetPath = path.join(userDir, filename);

        await fs.promises.writeFile(targetPath, buffer);
        const stats = await fs.promises.stat(targetPath);

        return {
            path: targetPath,
            size: stats.size,
            filename
        };
    },

    /**
     * Get a readable stream for a file, guarding against path traversal
     */
    read(filePath) {
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(baseStorageDir)) {
            throw new Error("Access denied: path outside storage root");
        }
        if (!fs.existsSync(resolvedPath)) {
            throw new Error("File not found on disk");
        }
        return fs.createReadStream(resolvedPath);
    },

    /**
     * Delete a file from disk
     */
    async delete(filePath) {
        try {
            const resolvedPath = path.resolve(filePath);
            if (!resolvedPath.startsWith(baseStorageDir)) {
                throw new Error("Access denied: path outside storage root");
            }
            if (fs.existsSync(resolvedPath)) {
                await fs.promises.unlink(resolvedPath);
            }
            return true;
        } catch (err) {
            console.error("Storage delete error:", err.message);
            return false;
        }
    },

    /**
     * Clean up files older than N days
     */
    async cleanup(retentionDays = 7) {
        try {
            const now = Date.now();
            const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

            const userDirs = await fs.promises.readdir(baseStorageDir);
            for (const userDir of userDirs) {
                const fullUserDirPath = path.join(baseStorageDir, userDir);
                const stat = await fs.promises.stat(fullUserDirPath);
                if (stat.isDirectory()) {
                    const files = await fs.promises.readdir(fullUserDirPath);
                    for (const file of files) {
                        const fullFilePath = path.join(fullUserDirPath, file);
                        const fileStat = await fs.promises.stat(fullFilePath);
                        if (now - fileStat.mtimeMs > maxAgeMs) {
                            await fs.promises.unlink(fullFilePath);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Storage cleanup error:", err.message);
        }
    }
};

export default storage;
