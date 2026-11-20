import { createRequire } from "module";

const require = createRequire(import.meta.url);

export const parsePdfBuffer = async (buffer) => {
    try {
        const pdfModule = require("pdf-parse");

        // Handle pdf-parse v2 (PDFParse class)
        if (pdfModule.PDFParse) {
            const parser = new pdfModule.PDFParse({ data: buffer });
            const textResult = await parser.getText();
            let numPages = 1;
            try {
                const info = await parser.getInfo();
                numPages = info?.pages || info?.total || 1;
            } catch (_) {}
            await parser.destroy().catch(() => {});

            const text = typeof textResult === "string" ? textResult : (textResult?.text || "");
            return {
                text,
                numpages: numPages
            };
        }

        // Handle pdf-parse v1 (function export)
        const parseFn = typeof pdfModule === "function" ? pdfModule : pdfModule.default;
        if (typeof parseFn === "function") {
            const data = await parseFn(buffer);
            return {
                text: data.text || "",
                numpages: data.numpages || 1
            };
        }

        return { text: "", numpages: 1 };
    } catch (err) {
        console.warn("⚠️ PDF parse warning:", err.message);
        return { text: "", numpages: 1, error: err.message };
    }
};

export default parsePdfBuffer;
