/**
 * check-web.ts — Verify the Vibeo editor loads without JS errors.
 *
 * Usage: bun run check-web.ts <url>
 *
 * Uses puppeteer to navigate to the URL, execute the page in a real
 * headless Chrome, detect runtime JS errors (TypeError, ReferenceError,
 * SyntaxError, "is not defined", "is not a function", error overlays),
 * verify the page is not blank (body text length > 10 after settle),
 * and take a mandatory screenshot.
 *
 * Exits 0 if OK, 1 if errors found.
 */

import puppeteer from "puppeteer";

const url = process.argv[2];
if (!url) {
  console.error("Usage: bun run check-web.ts <url>");
  process.exit(1);
}

const SCREENSHOT_PATH =
  "/home/pe/newnewrepos/w/yo/vibeo/editor-screenshot.png";
const SETTLE_MS = 8000;

async function checkPage(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Wait for server to be reachable
  let reachable = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        reachable = true;
        break;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!reachable) {
    errors.push("Could not reach the server at " + url);
    return { ok: false, errors };
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Capture runtime JS errors
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Wait for page to settle (React render, compositions register)
    await new Promise((r) => setTimeout(r, SETTLE_MS));

    // 1. Check for runtime JS errors matching our patterns
    const jsErrorPatterns = [
      "TypeError",
      "ReferenceError",
      "SyntaxError",
      "is not defined",
      "is not a function",
    ];

    for (const err of jsErrors) {
      for (const pattern of jsErrorPatterns) {
        if (err.includes(pattern)) {
          errors.push(`Runtime JS error: ${err}`);
          break;
        }
      }
    }

    // 2. Check for error overlay elements in the DOM
    const hasOverlay = await page.evaluate(() => {
      return !!(
        document.querySelector("[data-error-overlay]") ||
        document.querySelector(".error-overlay") ||
        document.querySelector("vite-error-overlay")
      );
    });
    if (hasOverlay) {
      errors.push("Error overlay detected in DOM");
    }

    // 3. Verify body text length > 10 (not a blank page)
    const textLen = await page.evaluate(
      () => document.body?.innerText?.length ?? 0,
    );
    if (textLen <= 10) {
      errors.push(
        `Page appears blank: body text length is ${textLen} (expected > 10)`,
      );
    }

    // 4. Take mandatory screenshot — failure is a check error
    let screenshotTaken = false;
    try {
      await page.screenshot({ path: SCREENSHOT_PATH });
      console.log(`Screenshot saved to ${SCREENSHOT_PATH}`);
      screenshotTaken = true;
    } catch {
      // screenshot failed
    }

    if (!screenshotTaken) {
      errors.push("Screenshot could not be taken");
    }
  } finally {
    await browser.close();
  }

  return { ok: errors.length === 0, errors };
}

const result = await checkPage();

if (result.ok) {
  console.log("OK — Editor page loaded successfully");
  process.exit(0);
} else {
  console.error("ERRORS found:");
  for (const err of result.errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}
