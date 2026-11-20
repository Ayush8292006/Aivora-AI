import assert from "assert";
import { router } from "../graph/router.js";

async function runRouterTests() {
    console.log("🚀 Testing Router Deterministic Decisions...\n");

    // Case 1: Explicit agent selection
    const r1 = await router({ prompt: "make a website", agent: "image" });
    assert.strictEqual(r1.agent, "image", "Explicit agent 'image' should be respected");

    const r2 = await router({ prompt: "make a website", agent: "vision" });
    assert.strictEqual(r2.agent, "image", "Legacy 'vision' should be mapped to 'image'");

    // Case 2: Attachment routing
    const r3 = await router({ 
        prompt: "kya likha hai isme", 
        agent: "auto", 
        attachments: [{ kind: "pdf", mimeType: "application/pdf", name: "doc.pdf" }] 
    });
    assert.strictEqual(r3.agent, "pdf", "PDF attachment should route to 'pdf'");

    const r4 = await router({ 
        prompt: "explain this screenshot", 
        agent: "auto", 
        attachments: [{ kind: "image", mimeType: "image/png", name: "shot.png" }] 
    });
    assert.strictEqual(r4.agent, "image", "Image attachment should route to 'image'");

    // Case 3: Keyword routing (English + Hindi)
    const r5 = await router({ prompt: "Solar energy par 8 slide ka presentation banao", agent: "auto" });
    assert.strictEqual(r5.agent, "ppt", "Prompt with 'presentation' should route to 'ppt'");

    const r6 = await router({ prompt: "Mera resume banao: React developer with 2 projects", agent: "auto" });
    assert.strictEqual(r6.agent, "pdf", "Prompt with 'resume' should route to 'pdf'");

    const r7 = await router({ prompt: "Ek futuristic sunset wallpaper generate karo", agent: "auto" });
    assert.strictEqual(r7.agent, "image", "Prompt with 'wallpaper' should route to 'image'");

    console.log("✅ All Router Deterministic Tests Passed!\n");
}

runRouterTests().catch(err => {
    console.error("Router tests failed:", err);
    process.exit(1);
});
