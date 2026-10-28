import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend<{ runtimeCheck: void }>({
  runtimeCheck: [async ({ page }, use, testInfo) => {
    const reset = await fetch("http://127.0.0.1:3101/__reset", { method: "POST" });
    expect(reset.ok).toBe(true);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith("http://127.0.0.1:3100/") && response.status() >= 500) errors.push(`HTTP ${response.status()} ${response.url()}`);
    });
    await use();
    if (errors.length) await testInfo.attach("browser-runtime-errors", { body: errors.join("\n"), contentType: "text/plain" });
    expect(errors, "Unhandled browser exceptions and local application HTTP failures").toEqual([]);
  }, { auto: true }],
});
export { expect };

export async function openSteamTools(page: Page) {
  await page.waitForURL(/\/(?:profile\/import\/steam|login)/);
  if (new URL(page.url()).pathname !== "/profile/import/steam") return;
  const summary = page.locator("summary").filter({hasText:/^(Steam library tools|Herramientas de la biblioteca de Steam)$/});
  const connect = page.getByRole("button", {name:/^(Connect Steam|Conectar Steam)$/});
  await expect(summary.or(connect).first()).toBeVisible();
  if (await summary.count() && !await summary.evaluate(element => element.parentElement!.hasAttribute("open"))) await summary.click();
}
