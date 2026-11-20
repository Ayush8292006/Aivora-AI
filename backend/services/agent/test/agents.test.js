// Automated verification tests for Aivora AI Agent Service
import assert from "assert";
import path from "path";
import fs from "fs";
import storage from "../storage/storage.js";
import { buildPptxDeck } from "../utils/pptxBuilder.js";
import { sanitizePdfHtml } from "../utils/pdfRenderer.js";

async function runTests() {
    console.log("🚀 Starting Agent Service Automated Tests...\n");
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ FAIL: ${name} ->`, err.message);
            failed++;
        }
    };

    // Test 1: Storage save, read, delete
    await test("Storage adapter: save, read and delete file", async () => {
        const dummyBuffer = Buffer.from("Test file content for Aivora AI storage", "utf-8");
        const saved = await storage.save({
            userId: "test_user_123",
            buffer: dummyBuffer,
            ext: "txt"
        });

        assert.ok(saved.path, "Saved path should exist");
        assert.ok(fs.existsSync(saved.path), "Saved file should exist on disk");
        assert.strictEqual(saved.size, dummyBuffer.length, "File size should match");

        // Read stream and consume it
        const stream = storage.read(saved.path);
        const chunks = [];
        await new Promise((resolve, reject) => {
            stream.on("data", chunk => chunks.push(chunk));
            stream.on("end", resolve);
            stream.on("error", reject);
        });
        const readContent = Buffer.concat(chunks).toString("utf-8");
        assert.strictEqual(readContent, "Test file content for Aivora AI storage");

        // Delete
        const deleted = await storage.delete(saved.path);
        assert.strictEqual(deleted, true, "Delete should return true");
        assert.ok(!fs.existsSync(saved.path), "File should be removed from disk");
    });

    // Test 2: Storage path traversal protection
    await test("Storage adapter: path traversal protection", async () => {
        assert.throws(() => {
            storage.read("C:\\Windows\\System32\\drivers\\etc\\hosts");
        }, /Access denied/, "Should throw access denied for outside paths");
    });

    // Test 3: PPTX builder generates valid PPTX buffer
    await test("PPTX Builder: generate presentation buffer", async () => {
        const testDeck = {
            title: "AI in Healthcare",
            theme: "corporate",
            slides: [
                {
                    layout: "title",
                    title: "AI in Healthcare",
                    subtitle: "Transforming Modern Medicine"
                },
                {
                    layout: "bullets",
                    title: "Core Advancements",
                    bullets: [
                        "Automated diagnostic imaging",
                        "Accelerated drug discovery",
                        "Predictive patient monitoring"
                    ],
                    notes: "Explain impact of transformers on biology."
                },
                {
                    layout: "stats",
                    title: "Impact Metrics",
                    stats: [
                        { label: "Accuracy Gain", value: "98.5%" },
                        { label: "Time Saved", value: "60%" }
                    ]
                },
                {
                    layout: "closing",
                    title: "Thank You",
                    subtitle: "Questions & Answers"
                }
            ]
        };

        const buffer = await buildPptxDeck(testDeck);
        assert.ok(Buffer.isBuffer(buffer), "Result should be a buffer");
        assert.ok(buffer.length > 5000, "PPTX buffer size should be substantial");
        // PPTX is a zip file, starting with PK (0x50 0x4B 0x03 0x04)
        assert.strictEqual(buffer[0], 0x50, "Magic byte 0 should be P");
        assert.strictEqual(buffer[1], 0x4B, "Magic byte 1 should be K");
    });

    // Test 4: PDF HTML Sanitizer
    await test("PDF Renderer: sanitize malicious tags while preserving styles", async () => {
        const maliciousHtml = `<div>
            <script>alert('pwned')</script>
            <h1>Safe Heading</h1>
            <style>h1 { color: red; }</style>
            <p>Body paragraph with <script src="evil.js"></script> content</p>
        </div>`;

        const sanitized = sanitizePdfHtml(maliciousHtml);
        assert.ok(!sanitized.includes("<script>"), "Should strip script tag");
        assert.ok(!sanitized.includes("evil.js"), "Should strip external script");
        assert.ok(sanitized.includes("Safe Heading"), "Should preserve heading");
        assert.ok(sanitized.includes("<style>"), "Should preserve inline style for layout");
    });

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
