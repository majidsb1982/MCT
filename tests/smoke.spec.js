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
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
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
    const d = Store.get();
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
  await page.locator('#nav button[aria-label="بیشتر"]').click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();
  await page.locator("#btnAddUser").click();
  await page.locator("#uName").fill("کاربر آزمون");
  await page.locator("#uPin").fill("2468");
  await page.locator("#uRole").selectOption("view");
  await page.locator("#uSave").click();
  await expect.poll(() => page.evaluate(() => {
    const d = Store.get();
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

test("session pruning removes only fees tied to pruned sessions", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    Store.save();
    const d = Store.get();
    d.settings.maxSessions = 1;
    d.sessions = {
      "1405-01-01": { memberA: { p1: "present" } },
      "1405-01-02": { memberA: { p1: "absent" } }
    };
    d.fees = {
      "1405-01-01": { memberA: { paid: true } },
      "1405-01-02": { memberA: { paid: false } },
      "1399-01-01": { memberB: { paid: true } }
    };
    localStorage.setItem("mct:data", JSON.stringify(d));
    if (typeof Store !== "undefined") Store.load?.();
    location.reload();
  });
  await page.waitForFunction(() => typeof window.pruneSessions === "function");
  const removed = await page.evaluate(() => window.pruneSessions(1));
  expect(removed).toBe(1);
  const result = await page.evaluate(() => {
    const d = Store.get();
    return { sessions: Object.keys(d.sessions), fees: Object.keys(d.fees) };
  });
  expect(result.sessions).toEqual(["1405-01-02"]);
  expect(result.fees).toContain("1405-01-02");
  expect(result.fees).toContain("1399-01-01");
  expect(result.fees).not.toContain("1405-01-01");
});


test("attendance page uses a clear title without the redundant instruction banner", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="حضور"]').click();
  await expect(page.locator("#app")).toContainText("پیگیری تماس‌های قبل از جلسه");
  await expect(page.locator("#app .round-banner")).toHaveCount(0);
});

test("member list offers name, family name, birth date and phone sorting", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [
      { id: "m-a", name: "علی زارعی", phones: ["09120000002"], birth: { jy: 1370, jm: 2, jd: 3 }, roles: [], group: "عمومی" },
      { id: "m-b", name: "رضا احمدی", phones: ["09120000001"], birth: { jy: 1365, jm: 1, jd: 1 }, roles: [], group: "عمومی" },
      { id: "m-c", name: "مریم بهرامی", phones: ["09120000003"], birth: { jy: 1375, jm: 5, jd: 7 }, roles: [], group: "عمومی" }
    ];
    d.pinnedMembers = [];
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await expect(page.locator("#memberSort")).toBeVisible();
  await page.locator("#memberSort").selectOption("family");
  let names = await page.locator("#mList .mem-name b").allTextContents();
  expect(names[0]).toBe("رضا احمدی");
  await page.locator("#memberSort").selectOption("birth");
  names = await page.locator("#mList .mem-name b").allTextContents();
  expect(names[0]).toBe("رضا احمدی");
  await page.locator("#memberSort").selectOption("phone");
  names = await page.locator("#mList .mem-name b").allTextContents();
  expect(names[0]).toBe("رضا احمدی");
});

test("fees page presents a compact summary and supporter report action", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "fee-test", name: "عضو شهریه", phones: ["09120000000"], roles: [], group: "عمومی" }];
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="شهریه"]').click();
  await expect(page.locator("#app .fee-summary")).toContainText("خلاصه شهریه جلسه");
  await expect(page.locator("#btnFeeHami")).toBeVisible();
});


test("therapist door reminders open in a separate dialog from the home screen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /یادآور درمانگر/ }).click();
  await expect(page.locator("#doorChecklistDialog")).toContainText("یادآور پشت در");
  await page.locator("#doorChecklistDialog [data-door-check='15']").click();
  await expect(page.locator("#doorChecklistDialog .door-item").first()).toContainText("✓");
  await page.locator("#doorChecklistClose").click();
  await expect(page.locator("#doorChecklistDialog")).toHaveCount(0);
});


test("member creation action remains available after the member list", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "ux-member", name: "عضو تجربه", phones: [], roles: [], group: "عمومی" }];
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await expect(page.locator(".members-add-bar button")).toContainText("ثبت عضو جدید");
  await expect(page.locator(".members-add-bar")).toBeVisible();
});

test("fee session selector switches the active session without mixing payment records", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "ux-fee-member", name: "عضو آزمایشی", phones: [], roles: [], group: "عمومی" }];
    d.sessions = {
      "1405-01-01": { "ux-fee-member": { p1: "present" } },
      "1405-01-08": { "ux-fee-member": { p1: "absent" } }
    };
    d.fees = {
      "1405-01-01": { "ux-fee-member": { paid: true } },
      "1405-01-08": { "ux-fee-member": { paid: false } }
    };
    d._lastSession = "1405-01-08";
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="شهریه"]').click();
  await expect(page.locator("#feeSessionSelect")).toBeVisible();
  await expect(page.locator("#app .fee-summary")).toContainText("پرداخت‌نشده");
  await page.locator("#feeSessionSelect").selectOption("1405-01-01");
  await expect(page.locator("#app .fee-summary")).toContainText("تسویه کامل");
  const selected = await page.evaluate(() => ({
    active: Store.get()._lastSession,
    feeKey: document.querySelector(".payrow")?.getAttribute("data-key")
  }));
  expect(selected.active).toBe("1405-01-01");
  expect(selected.feeKey).toBe("1405-01-01");
  const records = await page.evaluate(() => {
    const d = Store.get();
    return [d.fees["1405-01-01"]["ux-fee-member"].paid, d.fees["1405-01-08"]["ux-fee-member"].paid];
  });
  expect(records).toEqual([true, false]);
});

test("absence reason is saved against the selected session and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "reason-member", name: "عضو دلیل غیبت", phones: [], roles: [], group: "عمومی" }];
    d.sessions = {
      "1405-01-01": { "reason-member": { p1: "present" } },
      "1405-01-08": {}
    };
    d._lastSession = "1405-01-08";
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  const member = page.locator('.mblk[data-mid="reason-member"]');
  await member.locator('.st-btn[data-s="absent"]').click();
  await page.getByRole("button", { name: /ثبت‌شده/ }).click();
  const memberRecorded = page.locator('.mblk[data-mid="reason-member"]');
  const reason = "بیماری و اطلاع قبلی";
  await memberRecorded.locator('input[name="note-reason-member"]').fill(reason);
  await memberRecorded.locator('input[name="note-reason-member"]').press("Tab");
  await expect.poll(() => page.evaluate(() => {
    const d = Store.get();
    return d.sessions["1405-01-08"]["reason-member"]?.note;
  })).toBe(reason);
  const stored = await page.evaluate(() => Store.get().sessions["1405-01-01"]["reason-member"].p1);
  expect(stored).toBe("present");
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  await page.getByRole("button", { name: /ثبت‌شده/ }).click();
  await expect(page.locator('.mblk[data-mid="reason-member"] input[name="note-reason-member"]')).toHaveValue(reason);
});



test("supporter attendance report is isolated to the selected session", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.users = [{ id: "report-admin", name: "آزمون مدیر", pin: "2468", role: "admin" }];
    d.currentUserId = "report-admin";
    d.settings.requireLogin = false;
    // The former member remains only in historical session data, not the current roster.
    d.members = [
      { id: "report-member", name: "عضو گزارش", phones: [], roles: [], group: "عمومی" }
    ];
    d.sessions = {
      "1405-01-01": {
        "report-member": { p1: "present", note: "یادداشت جلسه قدیمی که نباید بیاید" },
        "old-member": { p1: "absent", note: "دلیل قدیمی" }
      },
      "1405-01-08": {
        "report-member": { p1: "absent", note: "بیماری همان جلسه" }
      }
    };
    d._lastSession = "1405-01-08";
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  await page.getByRole("button", { name: /گزارش به حامی/ }).click();
  const report = page.locator("#rndRep");
  await expect(report).toBeVisible();
  await expect(report).toHaveValue(/جلسه: ۱۴۰۵\/۰۱\/۰۸/);
  await expect(report).toHaveValue(/بیماری همان جلسه/);
  await expect(report).not.toHaveValue(/یادداشت جلسه قدیمی که نباید بیاید/);
  // Historical notes/statuses must not leak into the selected-session report.
  await expect(report).not.toHaveValue(/دلیل قدیمی/);
});


test("second-round supporter report uses only second-round status, time, and note", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.users = [{ id: "report-admin", name: "آزمون مدیر", pin: "2468", role: "admin" }];
    d.currentUserId = "report-admin";
    d.settings.requireLogin = false;
    d.members = [{ id: "round-member", name: "عضو نوبت دوم", phones: [], roles: [], group: "عمومی" }];
    d.sessions = {
      "1405-01-08": {
        "round-member": {
          p1: "absent", note: "یادداشت نوبت اول",
          p2: "delay", time: "18:10", note2: "توضیح نوبت دوم", time2: "18:25"
        }
      }
    };
    d._lastSession = "1405-01-08";
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.evaluate(() => window.reportRoundToHami(2));
  const report = page.locator("#rndRep");
  await expect(report).toBeVisible();
  await expect(report).toHaveValue(/نوبت ۲/);
  await expect(report).toHaveValue(/توضیح نوبت دوم/);
  await expect(report).toHaveValue(/۱۸:۲۵/);
  await expect(report).not.toHaveValue(/یادداشت نوبت اول/);
  await expect(report).not.toHaveValue(/۱۸:۱۰/);
});


test("legacy backup restore reapplies migration defaults without losing member data", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="بیشتر"]').click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();
  const legacy = {
    v: 3,
    members: [{ id: "legacy-restore", name: "عضو نسخه قدیمی", phone: "09120000009" }],
    classes: [{ dow: 3, start: "19:00", end: "21:00" }],
    settings: { color: "blue" }
  };
  await page.locator("#rf").setInputFiles({
    name: "legacy-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(legacy), "utf8")
  });
  await expect(page.locator(".overlay")).toBeVisible();
  await page.locator("#cy").click();

  const restored = await page.evaluate(() => {
    const d = Store.get();
    const member = d.members.find(m => m.id === "legacy-restore");
    return {
      member: member && {
        name: member.name, phones: member.phones, supporterId: member.supporterId,
        careFlag: member.careFlag, needs: member.needs, consentContact: member.consentContact,
        consentPhoto: member.consentPhoto, roles: member.roles
      },
      settings: {
        lastBackupAt: d.settings.lastBackupAt, autoTheme: d.settings.autoTheme,
        a11y: d.settings.a11y, focusMode: d.settings.focusMode, onlyMine: d.settings.onlyMine,
        oled: d.settings.oled, smartSort: d.settings.smartSort
      }
    };
  });
  expect(restored.member).toMatchObject({
    name: "عضو نسخه قدیمی", phones: ["09120000009"], supporterId: null,
    careFlag: false, needs: [], consentContact: true, consentPhoto: true, roles: []
  });
  expect(restored.settings).toEqual({
    lastBackupAt: null, autoTheme: false, a11y: false, focusMode: false,
    onlyMine: false, oled: false, smartSort: true
  });
});


test("member phone validation normalizes Persian and Arabic digits and warns before sharing a number", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="اعضا"]').click();

  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill("عضو دارای شماره");
  await page.locator('input[name="m-phone-0"]').fill("۰۹۱۲۳۴۵۶۷۸۹");
  await page.locator("#fSave").click();
  await expect.poll(() => page.evaluate(() => Store.get().members.length)).toBe(1);

  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill("عضو شماره مشترک");
  await page.locator('input[name="m-phone-0"]').fill("٠٩١٢٣٤٥٦٧٨٩");
  await page.locator("#fSave").click();

  await expect(page.locator(".overlay").filter({ hasText: "این شماره با عضو دیگری مشترک است" })).toBeVisible();
  await page.locator("#cy").click();
  await expect.poll(() => page.evaluate(() => Store.get().members.length)).toBe(2);
});
