import type { Page } from "playwright";

/**
 * Navigate the headless browser page to render a specific frame.
 *
 * 1. Call window.vibeo_setFrame(frame, compositionId) to update the React tree.
 * 2. Wait for React render to complete (poll for window.vibeo_ready flag).
 * 3. Wait for all fonts to load.
 * 4. Wait for any pending delayRender handles to resolve.
 */
export async function seekToFrame(
  page: Page,
  frame: number,
  compositionId: string,
): Promise<void> {
  // Set the frame via the global bridge function
  await page.evaluate(
    ({ frame, compositionId }) => {
      const win = window as typeof window & {
        vibeo_setFrame?: (frame: number, compositionId: string) => void;
      };
      if (typeof win.vibeo_setFrame === "function") {
        win.vibeo_setFrame(frame, compositionId);
      } else {
        throw new Error(
          "window.vibeo_setFrame is not defined. " +
            "Make sure the bundle registers this function.",
        );
      }
    },
    { frame, compositionId },
  );

  // Wait for React to finish rendering and all delays to resolve
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const timeout = 30_000;
      const start = Date.now();

      function poll() {
        const win = window as typeof window & {
          vibeo_ready?: boolean;
          vibeo_pendingDelays?: number;
        };

        if (Date.now() - start > timeout) {
          reject(new Error("Timed out waiting for frame render"));
          return;
        }

        const ready = win.vibeo_ready === true;
        const noPendingDelays =
          win.vibeo_pendingDelays === undefined || win.vibeo_pendingDelays === 0;

        if (ready && noPendingDelays) {
          resolve();
        } else {
          requestAnimationFrame(poll);
        }
      }

      poll();
    });
  });

  // Wait for all fonts to be ready
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Load the bundled app in the browser page.
 */
export async function loadBundle(
  page: Page,
  url: string,
): Promise<void> {
  await page.goto(url, { waitUntil: "networkidle" });

  // Wait for the vibeo_setFrame bridge to be available
  await page.waitForFunction(
    () => {
      const win = window as typeof window & {
        vibeo_setFrame?: unknown;
      };
      return typeof win.vibeo_setFrame === "function";
    },
    { timeout: 30_000 },
  );
}
