const { test, expect } = require("@playwright/test");

test("app shell loads and local scripts/styles are available", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  const response = await page.goto("/");
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#app")).toBeAttached();
  await expect(page.locator("#nav")).toBeAttached();
  await expect(page.locator("#hdr")).toBeVisible();

  // Wait briefly for the app's own bootstrap/render cycle.
  await page.waitForTimeout(1200);
  const appHasContent = await page.locator("#app").evaluate(el => el.children.length > 0);
  expect(appHasContent, "Application root should render a screen instead of remaining blank").toBeTruthy();

  const brokenLocalAssets = await page.locator('script[src], link[rel="stylesheet"][href]').evaluateAll(nodes =>
    nodes.map(node => node.src || node.href)
      .filter(url => url.startsWith(location.origin))
      .filter(url => {
        const resource = performance.getEntriesByName(url).find(entry => entry.responseStatus !== undefined);
        return resource && resource.responseStatus >= 400;
      })
  );
  expect(brokenLocalAssets, "No local JavaScript or CSS asset should return an HTTP error").toEqual([]);
  expect(pageErrors, "No uncaught JavaScript errors during initial rendering").toEqual([]);
});

test("desktop layout does not create unintended horizontal page overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hdr")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(dimensions.page, `Unexpected horizontal overflow: page ${dimensions.page}px, viewport ${dimensions.viewport}px`)
    .toBeLessThanOrEqual(dimensions.viewport + 1);
});

test("mobile layout remains within the device viewport and produces a screenshot", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#hdr")).toBeVisible();
  await page.waitForTimeout(500);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  expect(dimensions.page, `Unexpected mobile horizontal overflow: page ${dimensions.page}px, viewport ${dimensions.viewport}px`)
    .toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.height).toBeGreaterThan(200);

  await page.screenshot({ path: testInfo.outputPath("mct-mobile-full-page.png"), fullPage: true });
});

test("header navigation controls are present and accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#backBtn")).toBeAttached();
  await expect(page.locator("#exitBtn")).toBeVisible();
  await expect(page.locator("#themeBtn")).toBeVisible();
  await expect(page.locator("#backBtn")).toHaveAttribute("aria-label", "بازگشت");
});
