import type { Browser, Page } from "playwright";

let _browser: Browser | null = null;

/**
 * Launch a headless Chromium browser via Playwright.
 * Reuses the existing browser if already launched.
 */
export async function launchBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) {
    return _browser;
  }
  const { chromium } = await import("playwright");
  _browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--allow-file-access-from-files",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  return _browser;
}

/**
 * Close the browser and release resources.
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

/**
 * Create a new browser page with a viewport matching the composition dimensions.
 */
export async function createPage(
  browser: Browser,
  width: number,
  height: number,
): Promise<Page> {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  return page;
}
