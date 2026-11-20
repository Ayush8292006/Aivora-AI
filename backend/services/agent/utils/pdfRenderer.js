import sanitizeHtml from "sanitize-html";
import puppeteer from "puppeteer";
import fs from "fs";

export const getBrowserExecutablePath = () => {
    const candidates = [
        process.env.CHROME_BIN,
        process.env.PUPPETEER_EXECUTABLE_PATH,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    ].filter(Boolean);

    for (const cand of candidates) {
        if (fs.existsSync(cand)) {
            return cand;
        }
    }
    return undefined;
};

/**
 * Sanitize LLM-generated HTML to ensure safety
 */
export const sanitizePdfHtml = (rawHtml) => {
    return sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "html", "head", "body", "style", "title", "meta",
            "table", "thead", "tbody", "tfoot", "tr", "th", "td",
            "section", "header", "footer", "article", "aside", "main", "nav",
            "h1", "h2", "h3", "h4", "h5", "h6", "hr", "br",
            "div", "span", "p", "ul", "ol", "li", "dl", "dt", "dd",
            "b", "i", "strong", "em", "code", "pre", "blockquote", "q",
            "img"
        ]),
        allowedAttributes: {
            "*": ["style", "class", "id"],
            "img": ["src", "alt", "width", "height"],
            "meta": ["charset", "name", "content"]
        },
        allowedSchemes: ["data", "http", "https"],
        allowVulnerableTags: true // for inline <style> block
    });
};

/**
 * Render sanitized HTML to a PDF buffer using Puppeteer
 */
export const renderHtmlToPdf = async (htmlContent) => {
    const executablePath = getBrowserExecutablePath();
    const browser = await puppeteer.launch({
        executablePath,
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--font-render-hinting=medium"
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Security: disable JavaScript inside the PDF page
        await page.setJavaScriptEnabled(false);

        // Security: intercept requests and block everything except data: URIs
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const url = req.url();
            if (url.startsWith("data:") || url === "about:blank") {
                req.continue();
            } else {
                req.abort();
            }
        });

        // Ensure default font stack with Hindi/Devanagari fallbacks
        const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
    @bottom-right {
      content: counter(page) " / " counter(pages);
      font-size: 9pt;
      color: #666;
    }
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Nirmala UI', 'Mangal', 'Segoe UI', 'Noto Sans', Arial, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  h1, h2, h3, h4 {
    color: #0f172a;
    page-break-after: avoid;
    font-weight: 700;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
  }
  tr {
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 8px 10px;
    text-align: left;
  }
  th {
    background-color: #f1f5f9;
    font-weight: 600;
  }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

        await page.setContent(wrappedHtml, {
            waitUntil: "load",
            timeout: 30000
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            },
            displayHeaderFooter: true,
            headerTemplate: `<div></div>`,
            footerTemplate: `
              <div style="width: 100%; font-size: 9pt; color: #94a3b8; text-align: right; padding-right: 15mm;">
                <span class="pageNumber"></span> / <span class="totalPages"></span>
              </div>
            `
        });

        return Buffer.from(pdfBuffer);

    } finally {
        await browser.close();
    }
};
