const { test, expect } = require("@playwright/test");

test("app shell loads without uncaught errors or missing local assets", async ({ page }) => {
  const pageErrors = [];
  const failedLocalRequests = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("requestfailed", request => {
    if (request.url().startsWith("http://127.0.0.1:4173/")) failedLocalRequests.push(request.url());
  });

  const response = await page.goto("/");
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("#app")).toBeAttached();
  await expect(page.locator("#nav")).toBeAttached();
  await expect(page.locator("#hdr")).toBeVisible();
  await expect(page.locator("#bootError")).toBeHidden();
  await expect(page.locator("#nav button").first()).toBeVisible();
  await expect.poll(() => page.locator("#app").evaluate(el => el.children.length)).toBeGreaterThan(0);
  expect(pageErrors, "No uncaught JavaScript errors during initial rendering").toEqual([]);
  expect(failedLocalRequests, "Local application resources should load successfully").toEqual([]);
});

test("desktop and mobile layouts do not overflow horizontally", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hdr")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  expect(dimensions.page, `Horizontal overflow: page ${dimensions.page}px, viewport ${dimensions.viewport}px`)
    .toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.height).toBeGreaterThan(200);
});

test("theme switch persists after rerender", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("body").evaluate(el => el.classList.contains("dark"));
  await page.locator("#themeBtn").click();
  await expect.poll(() => page.locator("body").evaluate(el => el.classList.contains("dark"))).toBe(!before);
  const savedTheme = await page.evaluate(() => JSON.parse(localStorage.getItem("mct:data")).settings.theme);
  expect(savedTheme).toBe(before ? "light" : "dark");
});

test("member can be created and remains in local storage", async ({ page }) => {
  await page.goto("/");
  const name = "آزمون خودکار اعضا";
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill(name);
  await page.locator("#fSave").click();
  await expect(page.locator("#mList")).toContainText(name);
  await page.reload();
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await expect(page.locator("#mList")).toContainText(name);
});

test("attendance status can be recorded and persists", async ({ page }) => {
  await page.goto("/");
  const name = "عضو آزمون حضور";
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill(name);
  await page.locator("#fSave").click();
  await page.locator('#nav button[aria-label="حضور"]').click();

  const memberRow = page.locator("#app .mem, #app .mblk").filter({ hasText: name }).first();
  await expect(memberRow).toBeVisible();
  const statusButton = memberRow.locator(".st-btn").first();
  await expect(statusButton).toBeVisible();
  await statusButton.click();

  await expect.poll(async () => page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("mct:data"));
    return Object.values(d.sessions || {}).some(session =>
      Object.values(session || {}).some(entry => entry && (entry.p1 || entry.p2))
    );
  })).toBeTruthy();
});

test("homework can be saved, archived and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="تکالیف"]').click();
  const task = "تکلیف آزمایشی برای تست خودکار";
  await page.locator("#hwText").fill(task);
  await page.getByRole("button", { name: /ذخیره/ }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mct:data")).homework.length))
    .toBeGreaterThan(0);

  await page.reload();
  await page.locator('#nav button[aria-label="تکالیف"]').click();
  await page.getByRole("button", { name: /آرشیو/ }).click();
  await expect(page.locator("#app")).toContainText(task);
});

test("user form saves a new role and four-digit PIN", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="تنظیمات"]').click();
  await page.evaluate(() => userForm());
  await page.locator("#uName").fill("کاربر آزمون");
  await page.locator("#uPin").fill("2468");
  await page.locator("#uRole").selectOption("view");
  await page.locator("#uSave").click();
  await expect.poll(() => page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("mct:data"));
    return (d.users || []).some(u => u.name === "کاربر آزمون" && u.pin === "2468" && u.role === "view");
  })).toBeTruthy();
});

test("mobile viewport screenshot is captured for visual review", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#hdr")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  expect(dimensions.page, `Mobile horizontal overflow: page ${dimensions.page}px, viewport ${dimensions.viewport}px`)
    .toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath("mct-mobile-full-page.png"), fullPage: true });
});
