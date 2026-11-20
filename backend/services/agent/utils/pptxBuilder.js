import PptxGenJS from "pptxgenjs";

export const THEMES = {
    modern: {
        bg: "FFFFFF",
        cardBg: "F1F5F9",
        titleColor: "0F172A",
        textColor: "334155",
        accentColor: "4F46E5",
        subColor: "64748B"
    },
    dark: {
        bg: "0F172A",
        cardBg: "1E293B",
        titleColor: "F8FAFC",
        textColor: "CBD5E1",
        accentColor: "818CF8",
        subColor: "94A3B8"
    },
    minimal: {
        bg: "FFFFFF",
        cardBg: "FAFAFA",
        titleColor: "111827",
        textColor: "374151",
        accentColor: "2563EB",
        subColor: "6B7280"
    },
    corporate: {
        bg: "FFFFFF",
        cardBg: "EFF6FF",
        titleColor: "1E3A8A",
        textColor: "1E293B",
        accentColor: "2563EB",
        subColor: "475569"
    },
    vibrant: {
        bg: "090D16",
        cardBg: "161C2C",
        titleColor: "FFFFFF",
        textColor: "E2E8F0",
        accentColor: "A855F7",
        subColor: "94A3B8"
    }
};

export const buildPptxDeck = async (deckData) => {
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = deckData.title || "Presentation";

    const themeName = (deckData.theme || "modern").toLowerCase();
    const theme = THEMES[themeName] || THEMES.modern;

    const slides = Array.isArray(deckData.slides) ? deckData.slides : [];

    slides.forEach((slideData, idx) => {
        const slide = pptx.addSlide();
        slide.background = { color: theme.bg };

        // Add speaker notes if provided
        if (slideData.notes) {
            slide.addNotes(slideData.notes);
        }

        const layout = (slideData.layout || "bullets").toLowerCase();

        // 1. Title Slide
        if (layout === "title" || idx === 0) {
            slide.addText(slideData.title || "Presentation", {
                x: "10%",
                y: "35%",
                w: "80%",
                h: 1.5,
                fontSize: 38,
                bold: true,
                color: theme.accentColor,
                align: "center"
            });

            if (slideData.subtitle) {
                slide.addText(slideData.subtitle, {
                    x: "15%",
                    y: "55%",
                    w: "70%",
                    h: 1.0,
                    fontSize: 20,
                    color: theme.subColor,
                    align: "center"
                });
            }
            return;
        }

        // Header for standard slides
        slide.addText(slideData.title || `Slide ${idx + 1}`, {
            x: 0.8,
            y: 0.6,
            w: "85%",
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: theme.titleColor
        });

        // 2. Closing Slide
        if (layout === "closing" || idx === slides.length - 1) {
            slide.addText(slideData.title || "Thank You", {
                x: "10%",
                y: "38%",
                w: "80%",
                h: 1.2,
                fontSize: 36,
                bold: true,
                color: theme.accentColor,
                align: "center"
            });
            if (slideData.subtitle) {
                slide.addText(slideData.subtitle, {
                    x: "15%",
                    y: "55%",
                    w: "70%",
                    h: 0.8,
                    fontSize: 18,
                    color: theme.subColor,
                    align: "center"
                });
            }
            return;
        }

        // 3. Stats Layout
        if (layout === "stats" && Array.isArray(slideData.stats) && slideData.stats.length > 0) {
            const count = Math.min(slideData.stats.length, 4);
            const cardWidth = 10.5 / count;

            slideData.stats.slice(0, 4).forEach((stat, sIdx) => {
                const xPos = 0.8 + sIdx * cardWidth;
                slide.addShape(pptx.ShapeType.roundRect, {
                    x: xPos,
                    y: 2.2,
                    w: cardWidth - 0.4,
                    h: 3.2,
                    fill: { color: theme.cardBg },
                    line: { color: theme.accentColor, width: 1 }
                });

                slide.addText(stat.value || "100%", {
                    x: xPos + 0.1,
                    y: 2.8,
                    w: cardWidth - 0.6,
                    h: 1.0,
                    fontSize: 32,
                    bold: true,
                    color: theme.accentColor,
                    align: "center"
                });

                slide.addText(stat.label || "Metric", {
                    x: xPos + 0.1,
                    y: 4.0,
                    w: cardWidth - 0.6,
                    h: 1.0,
                    fontSize: 14,
                    color: theme.textColor,
                    align: "center"
                });
            });
            return;
        }

        // 4. Comparison Table Layout
        if (layout === "comparison-table" && slideData.table && Array.isArray(slideData.table.rows)) {
            const headers = (slideData.table.headers || []).map(h => ({
                text: String(h),
                options: { bold: true, fill: theme.accentColor, color: "FFFFFF" }
            }));

            const rows = (slideData.table.rows || []).map(row => 
                (Array.isArray(row) ? row : []).map(cell => ({
                    text: String(cell),
                    options: { fill: theme.cardBg, color: theme.textColor }
                }))
            );

            const tableData = [headers, ...rows];
            slide.addTable(tableData, {
                x: 0.8,
                y: 1.8,
                w: 11.0,
                colW: Array(headers.length).fill(11.0 / (headers.length || 1)),
                fontSize: 13,
                border: { pt: 1, color: theme.cardBg }
            });
            return;
        }

        // 5. Two-column Layout
        if (layout === "two-column") {
            const leftItems = (slideData.left || []).map(item => ({ text: String(item), options: { bullet: true } }));
            const rightItems = (slideData.right || []).map(item => ({ text: String(item), options: { bullet: true } }));

            slide.addText(leftItems, {
                x: 0.8,
                y: 1.8,
                w: 5.2,
                h: 4.5,
                fontSize: 15,
                color: theme.textColor,
                lineSpacing: 26
            });

            slide.addText(rightItems, {
                x: 6.5,
                y: 1.8,
                w: 5.2,
                h: 4.5,
                fontSize: 15,
                color: theme.textColor,
                lineSpacing: 26
            });
            return;
        }

        // 6. Default Bullets Layout
        const bullets = Array.isArray(slideData.bullets) ? slideData.bullets : [];
        if (bullets.length > 0) {
            const bulletItems = bullets.slice(0, 6).map(b => ({
                text: String(b),
                options: { bullet: true, color: theme.textColor }
            }));

            slide.addText(bulletItems, {
                x: 1.0,
                y: 1.8,
                w: 10.5,
                h: 4.8,
                fontSize: 16,
                color: theme.textColor,
                lineSpacing: 30
            });
        }
    });

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    return buffer;
};
