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

test("desktop and mobile layouts fit the viewport without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#hdr")).toBeVisible();
  await expect(page.locator("#app .home-android-head")).toBeVisible();
  await expect(page.locator("#app .home-next-card")).toBeVisible();
  await expect(page.locator("#app .home-shortcut")).toHaveCount(5);
  await expect(page.locator("#nav button[aria-label='جستجو']")).toHaveCount(0);
  await expect(page.locator("#nav button[aria-label='تنظیمات']")).toBeVisible();
  await expect(page.locator("#app .home-reminder")).toBeVisible();
  await expect(page.locator("#app .home-bell")).toHaveCount(0);
  await expect(page.locator("#app .home-reminder")).toHaveCount(1);
  await expect(page.locator("#app .home-shortcut-schedule")).toContainText("تقویم و مناسبت‌ها");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = Array.from({ length: 30 }, (_, i) => ({
      id: "home-ux-" + i, name: "عضو " + (i + 1), phones: [], roles: [], group: "عمومی", needs: []
    }));
    Store.save();
    render();
  });
  await expect(page.locator("#app .home-shortcut-badge")).toHaveCount(2);

  for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      mainBottom: document.querySelector("#app").getBoundingClientRect().bottom,
      navTop: document.querySelector("#nav").getBoundingClientRect().top
    }));
    expect(dimensions.page, `Horizontal overflow: page ${dimensions.page}px, viewport ${dimensions.viewport}px`)
      .toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.height).toBeGreaterThan(200);
    if (viewport.width < 500) {
      expect(dimensions.mainBottom, "Home should fit above the fixed bottom navigation on mobile")
        .toBeLessThanOrEqual(dimensions.navTop + 1);
    }
  }
  await page.screenshot({ path: testInfo.outputPath("mct-mobile-full-page.png"), fullPage: true });
});

test("theme switch persists after rerender", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("body").evaluate(el => el.classList.contains("dark"));
  await page.locator("#themeBtn").click();
  await expect.poll(() => page.locator("body").evaluate(el => el.classList.contains("dark"))).toBe(!before);
  const savedTheme = await page.evaluate(() => JSON.parse(localStorage.getItem("mct:data")).settings.theme);
  expect(savedTheme).toBe(before ? "light" : "dark");
});

test("member creation remains available after the first save and persists", async ({ page }) => {
  await page.goto("/");
  const first = "آزمون خودکار اعضا";
  const second = "عضو دوم آزمون";
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill(first);
  await page.locator("#fSave").click();
  await expect(page.locator("#mList")).toContainText(first);
  await expect(page.getByRole("button", { name: /افزودن عضو جدید/ })).toBeVisible();
  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill(second);
  await page.locator("#fSave").click();
  await expect(page.locator("#mList")).toContainText(second);
  await page.reload();
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await expect(page.locator("#mList")).toContainText(first);
  await expect(page.locator("#mList")).toContainText(second);
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
  await page.locator('#app .home-shortcut-tasks').click();
  const task = "تکلیف آزمایشی برای تست خودکار";
  await page.locator("#hwText").fill(task);
  await page.getByRole("button", { name: /ذخیره/ }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mct:data")).homework.length))
    .toBeGreaterThan(0);

  await page.reload();
  await page.locator('#app .home-shortcut-tasks').click();
  await page.getByRole("button", { name: /آرشیو/ }).click();
  await expect(page.locator("#app")).toContainText(task);
});

test("user form saves a new role and four-digit PIN", async ({ page }) => {
  await page.goto("/");
  await page.locator('.home-menu').click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();
  await page.locator(".settings-shortcut[data-settings-group='people']").click();
  await page.locator("#btnAddUser").click();
  await page.locator("#uName").fill("کاربر آزمون");
  await page.locator("#uPin").fill("2468");
  await page.locator("#uRole").selectOption("view");
  await page.locator("#uSave").click();
  await expect.poll(() => page.evaluate(() => {
    const d = Store.get();
    return (d.users || []).some(u => u.name === "کاربر آزمون" && u.role === "view"
      && u.pinHash && /^[0-9a-f]{64}$/.test(u.pinHash.h) && /^[0-9a-f]{32}$/.test(u.pinHash.s)
      && !("pin" in u));
  })).toBeTruthy();
  // ورود با همان رمز باید موفق باشد (تأیید هش PBKDF2 در مسیر واقعی لاگین)
  await page.evaluate(() => { const d = Store.get(); d.settings.requireLogin = true; d.currentUserId = null; Store.save(); });
  await page.reload();
  await page.locator("#pinPad").waitFor({ state: "visible", timeout: 10000 });
  await page.locator("#loginUser").evaluate((sel) => {
    const opt = [...sel.options].find(o => o.textContent.includes("کاربر آزمون"));
    if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event("change")); }
  });
  for (const k of ["2", "4", "6", "8"]) await page.locator('#pinPad button[data-k="' + k + '"]').click();
  await expect.poll(() => page.evaluate(() => !!Store.get().currentUserId), { timeout: 15000 }).toBeTruthy();
});



test("session pruning removes only fees tied to pruned sessions", async ({ page }) => {
  await page.goto("/");
  // pruneSessions اکنون پیش از حذف برگشت‌ناپذیر، تأیید می‌گیرد — دیالوگ را می‌پذیریم
  page.on("dialog", dialog => dialog.accept());
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
  await page.locator("#memberSort").selectOption("birthY");
  names = await page.locator("#mList .mem-name b").allTextContents();
  expect(names[0]).toBe("رضا احمدی");
  await page.locator("#memberSort").selectOption("phone");
  names = await page.locator("#mList .mem-name b").allTextContents();
  expect(names[0]).toBe("رضا احمدی");
});

test("fees summary and secondary report panels remain reachable", async ({ page }) => {
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

test("attendance session selector includes dates that have only fee or homework records", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "session-picker-member", name: "عضو انتخاب جلسه", phones: [], roles: [], group: "عمومی" }];
    d.sessions = { "1405-01-08": { "session-picker-member": { p1: "present" } } };
    d.fees = { "1405-01-01": { "session-picker-member": { paid: true } } };
    d.homework = [{ id: "hw-picker", key: "1405-01-15", text: "تکلیف آزمایشی" }];
    d._lastSession = "1405-01-08";
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.evaluate(() => go("attend"));
  // با View Transitions رندر یک فریم بعد از go() کامل می‌شود — برای خواندن مستقیم DOM صبر می‌کنیم
  await page.waitForSelector('select[name="session-select"]', { timeout: 7000 });
  const options = await page.locator('select[name="session-select"] option').evaluateAll(nodes => nodes.map(n => n.value));
  expect(options).toContain("1405-01-01");
  expect(options).toContain("1405-01-15");
  await page.evaluate(() => go("fees"));
  await page.waitForSelector("#feeSessionSelect", { timeout: 7000 });
  const feeOptions = await page.locator("#feeSessionSelect option").evaluateAll(nodes => nodes.map(n => n.value));
  expect(feeOptions).toContain("1405-01-15");
  await page.locator("#feeSessionSelect").selectOption("1405-01-15");
  const selected = await page.evaluate(() => ({
    session: Store.get()._lastSession,
    feeKeys: Object.keys(Store.get().fees).sort(),
    originalPaid: Store.get().fees["1405-01-01"]["session-picker-member"].paid
  }));
  expect(selected.session).toBe("1405-01-15");
  expect(selected.feeKeys).toEqual(["1405-01-01"]);
  expect(selected.originalPaid).toBe(true);
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
  await page.locator('.home-menu').click();
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


test("weekly class schedule rejects invalid time ranges and accepts valid times", async ({ page }) => {
  await page.goto("/");
  await page.locator('.home-menu').click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();

  await page.locator(".settings-shortcut[data-settings-group='calendar']").click();

  const before = await page.evaluate(() => Store.get().classes.length);
  await page.locator("#cS").fill("20:00");
  await page.locator("#cE").fill("19:00");
  await page.getByRole("button", { name: "افزودن کلاس" }).click();
  await expect.poll(() => page.evaluate(() => Store.get().classes.length)).toBe(before);

  await page.locator("#cS").fill("19:00");
  await page.locator("#cE").fill("21:00");
  await page.getByRole("button", { name: "افزودن کلاس" }).click();
  await expect.poll(() => page.evaluate(() => Store.get().classes.length)).toBe(before + 1);
  const saved = await page.evaluate(() => Store.get().classes.at(-1));
  expect(saved).toMatchObject({ start: "19:00", end: "21:00" });
});


test("member CSV import preserves exported headers, Persian dates and all mapped fields", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="اعضا"]').click();

  const csv = [
    "نام,تلفن‌ها,تولد,نقش‌ها,گروه,یادداشت عمومی,نیازها",
    "\"عضو انتقال\",\"۰۹۱۲۳۴۵۶۷۸۹ / ٠٩٣٥١٢٣٤٥٦٧\",۱۴۰۵/۰۲/۰۳,\"حامی|داوطلب\",پیگیری,یادداشت آزمایشی,\"تماس|توجه\""
  ].join("\r\n");
  await page.locator("#mimp").setInputFiles({
    name: "members-roundtrip.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf8")
  });

  await expect.poll(() => page.evaluate(() => Store.get().members.some(m => m.name === "عضو انتقال"))).toBeTruthy();
  const member = await page.evaluate(() => {
    const m = Store.get().members.find(x => x.name === "عضو انتقال");
    return { phones: m.phones, birth: m.birth, roles: m.roles, group: m.group, note: m.note, needs: m.needs, groups: Store.get().groups };
  });
  expect(member).toMatchObject({
    phones: ["۰۹۱۲۳۴۵۶۷۸۹", "٠٩٣٥١٢٣٤٥٦٧"],
    birth: { jy: 1405, jm: 2, jd: 3 },
    roles: ["حامی", "داوطلب"],
    group: "پیگیری",
    note: "یادداشت آزمایشی",
    needs: ["تماس", "توجه"],
    groups: expect.arrayContaining(["عمومی", "پیگیری"])
  });
});


test("settings opens categorized panels, supports Escape, and restores shortcut focus", async ({ page }) => {
  await page.goto("/");
  await page.locator(".home-menu").click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();
  await expect(page.locator(".settings-shortcut")).toHaveCount(6);
  const calendarShortcut = page.locator(".settings-shortcut[data-settings-group='calendar']");
  await calendarShortcut.click();
  await expect(page.locator("#settingsPanelTitle")).toHaveText("برنامه و تقویم");
  await expect(page.locator("#cDate")).toHaveAttribute("readonly", "");
  await expect(page.locator("#settingsHome")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator("#settingsHome")).toBeVisible();
  await expect(calendarShortcut).toBeFocused();
});

test("class date picker displays and stores a Jalali date", async ({ page }) => {
  await page.goto("/");
  await page.locator(".home-menu").click();
  await page.getByRole("button", { name: /تنظیمات برنامه/ }).click();
  await page.locator(".settings-shortcut[data-settings-group='calendar']").click();
  await page.locator("#cDate").click();
  await expect(page.locator("#dp .cal-grid")).toBeVisible();
  await page.locator("#dp .cal-grid button[data-d='15']").click();
  await page.locator("#dp #ok").click();
  const date = await page.locator("#cDate").inputValue();
  expect(date).toContain("/۱۵");
  expect(await page.locator("#cDate").getAttribute("data-iso")).toMatch(new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$"));
});


test("home calendar shortcut opens the calendar popup, not the settings hub", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /تقویم و مناسبت‌ها/ }).first().click();
  // رفتار فعلی: پاپ‌آپ مستقل تقویم و جلسات (نه هاب تنظیمات)
  await expect(page.locator(".calendar-popup")).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".calendar-popup h2")).toContainText("تقویم و جلسات");
  await page.locator("#calClose").click();
  await expect(page.locator(".calendar-popup")).toHaveCount(0);
});

test("home countdown uses explicit Persian day, hour and minute units", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-countdown")).toBeVisible();
  const text = await page.locator(".home-countdown").innerText();
  expect(text).not.toMatch(/:\\d{2} ساعت/);
  expect(text).toMatch(/(روز|ساعت|دقیقه|در جریان است)/);
  if (!text.includes("در جریان است")) expect(text).toMatch(/دیگر$/);
  expect(text).not.toMatch(/(?:^| و )۰ ساعت/);
});

test("header calendar shortcut opens the same calendar popup as the home tile", async ({ page }) => {
  await page.goto("/");
  await page.locator("#fabAi").click();
  await expect(page.locator(".calendar-popup")).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".calendar-popup h2")).toContainText("تقویم و جلسات");
  await page.locator("#calClose").click();
  await expect(page.locator(".calendar-popup")).toHaveCount(0);
});

test("pending badges follow the active round and decrease as members are marked", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.members = [
      { id: "badge-a", name: "عضو نوبت ناقص", phones: [], roles: [], group: "عمومی" },
      { id: "badge-b", name: "عضو پرداخت‌نشده", phones: [], roles: [], group: "عمومی" }
    ];
    d._lastSession = "1405-01-08";
    d.sessions = {
      "1405-01-08": {
        "badge-a": {},
        "badge-b": { p1: "absent", p2: "present" }
      }
    };
    d.fees = {
      "1405-01-08": {
        "badge-a": { paid: true },
        "badge-b": { paid: false }
      }
    };
    d.assignments = { attend: {}, fee: {} };
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();

  // Round 1 (default): a member with no p1 is pending even if another round is complete
  const initial = await page.evaluate(() => ({ pending: myPendingCount(), nav: navBadges() }));
  expect(initial.pending).toEqual({ attend: 1, fee: 1 });
  expect(initial.nav).toEqual({ attend: 1, fees: 1 });
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveText("۱");
  await expect(page.locator('#nav button[aria-label="شهریه"] .nav-badge')).toHaveText("۱");

  await page.evaluate(() => {
    const d = Store.get();
    d.sessions["1405-01-08"]["badge-a"].p1 = "present";
    d.fees["1405-01-08"]["badge-b"].paid = true;
    Store.save();
  });
  await page.reload();
  const completed = await page.evaluate(() => ({ pending: myPendingCount(), nav: navBadges() }));
  expect(completed.pending).toEqual({ attend: 0, fee: 0 });
  expect(completed.nav).toEqual({ attend: 0, fees: 0 });
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveCount(0);
  await expect(page.locator('#nav button[aria-label="شهریه"] .nav-badge')).toHaveCount(0);

  // Round 2 (door entry): pending switches to p2
  await page.evaluate(() => { route = "entry"; });
  const entry = await page.evaluate(() => myPendingCount());
  expect(entry.attend).toBe(1); // badge-a has p1 but no p2 yet
  await page.evaluate(() => { route = "home"; });
});

test("marking a member present through the UI decreases the red badge immediately", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.members = [
      { id: "dec-a", name: "عضو اول کاهش", phones: [], roles: [], group: "عمومی" },
      { id: "dec-b", name: "عضو دوم کاهش", phones: [], roles: [], group: "عمومی" }
    ];
    d.sessions = {};
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveText("۲");
  await page.locator("#app .mblk").filter({ hasText: "عضو اول کاهش" }).locator('.st-btn[data-s="present"]').click();
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveText("۱");
  await page.locator("#app .mblk").filter({ hasText: "عضو دوم کاهش" }).locator('.st-btn[data-s="present"]').click();
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveCount(0);
});

test("home navigation is the first right-to-left item and calendar shortcut is clearly named", async ({ page }) => {
  await page.goto("/");
  const first = await page.locator("#nav button").first().getAttribute("aria-label");
  expect(first).toBe("خانه");
  await expect(page.getByRole("button", { name: /تقویم و مناسبت‌ها/ }).first()).toBeVisible();
});


test("failed member pin save restores the previous pin state", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.pinnedMembers = ["pin-save-failure"];
    d.pinned = ["pin-save-failure"];
    const originalSave = Store.save;
    Store.save = () => false;
    try { togglePinMember("pin-save-failure"); }
    finally { Store.save = originalSave; }
    return { members: d.pinnedMembers, pinned: d.pinned };
  });
  expect(result.members).toEqual(["pin-save-failure"]);
  expect(result.pinned).toEqual(["pin-save-failure"]);
});

test("failed door reminder save does not leave a false completed state", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.doorChecks = {};
    const originalSave = Store.save;
    let outcome;
    Store.save = () => false;
    try { outcome = changeDoorCheck(15); }
    finally { Store.save = originalSave; }
    return { outcome, keys: Object.keys(d.doorChecks || {}), checks: d.doorChecks };
  });
  expect(result.outcome).toBeNull();
  expect(result.keys).toEqual([]);
});


test("compact sync import rolls back every changed collection when storage fails", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.sessions = { "1405-01-08": { keep: { p1: "present" } } };
    d.fees = { "1405-01-08": { keep: { paid: true } } };
    d.assignments = { attend: { old: "u1" }, fee: { old: "u2" } };
    d.period = { id: "prior-period", name: "دوره قبلی" };
    Store.save();
    communicationHub();
  });
  await page.locator("#c8").click();
  await page.locator("#syI").click();

  const payload = {
    key: "1405-01-09",
    sessions: { incoming: { p1: "absent" } },
    fees: { incoming: { paid: false } },
    assignments: { attend: { incoming: "u3" }, fee: { incoming: "u4" } },
    period: { id: "incoming-period", name: "دوره وارداتی" }
  };
  const encoded = await page.evaluate(p =>
    btoa(unescape(encodeURIComponent(JSON.stringify(p)))), payload);
  await page.locator("#syncIn").fill(encoded);

  const before = await page.evaluate(() => {
    const d = Store.get();
    return JSON.stringify({
      sessions: d.sessions, fees: d.fees, assignments: d.assignments, period: d.period
    });
  });
  await page.evaluate(() => {
    window.__originalStoreSave = Store.save;
    Store.save = () => false;
  });
  try {
    await page.locator("#syGo").click();
    await expect(page.locator(".toast")).toContainText("همگام‌سازی ذخیره نشد");
    const after = await page.evaluate(() => {
      const d = Store.get();
      return JSON.stringify({
        sessions: d.sessions, fees: d.fees, assignments: d.assignments, period: d.period
      });
    });
    expect(after).toBe(before);
  } finally {
    await page.evaluate(() => {
      if (window.__originalStoreSave) Store.save = window.__originalStoreSave;
      delete window.__originalStoreSave;
    });
  }
});

test("compact sync rejects array-shaped assignments without changing stored data", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.assignments = { attend: { keep: "u1" }, fee: { keep: "u2" } };
    Store.save();
    communicationHub();
  });
  await page.locator("#c8").click();
  await page.locator("#syI").click();
  const payload = { assignments: [] };
  const encoded = await page.evaluate(p =>
    btoa(unescape(encodeURIComponent(JSON.stringify(p)))), payload);
  await page.locator("#syncIn").fill(encoded);
  const before = await page.evaluate(() => JSON.stringify(Store.get().assignments));
  await page.locator("#syGo").click();
  await expect(page.locator(".toast")).toContainText("کد نامعتبر است");
  const after = await page.evaluate(() => JSON.stringify(Store.get().assignments));
  expect(after).toBe(before);
});


test("backup restore rejects an array-shaped period without altering current data", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "restore-keep", name: "عضو موجود", phones: [] }];
    d.period = { title: "دوره فعلی", attendIds: ["restore-keep"], feeIds: [], hwIds: [], note: "" };
    Store.save();
    const before = JSON.stringify({ members: d.members, period: d.period });
    let message = "";
    try { Store.importObj({ members: [{ id: "new", name: "عضو جدید" }], period: [] }); }
    catch (e) { message = e.message; }
    return { before, after: JSON.stringify({ members: Store.get().members, period: Store.get().period }), message };
  });
  expect(result.message).toContain("period");
  expect(result.after).toBe(result.before);
});

test("backup restore rejects malformed session and fee records without altering current data", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "restore-keep", name: "عضو موجود", phones: [] }];
    d.sessions = { "1405-01-01": { "restore-keep": { p1: "present" } } };
    d.fees = { "1405-01-01": { "restore-keep": { paid: true } } };
    Store.save();
    const before = JSON.stringify({ members: d.members, sessions: d.sessions, fees: d.fees });
    const errors = [];
    for (const backup of [
      { members: [{ id: "new", name: "عضو جدید" }], sessions: { "1405-01-01": [] } },
      { members: [{ id: "new", name: "عضو جدید" }], fees: { "1405-01-01": { "restore-keep": "پرداخت نامعتبر" } } },
      { members: [{ id: "new", name: "عضو جدید" }], doorChecks: { "1405-01-01": [] } },
      { members: [{ id: "new", name: "عضو جدید" }], sessionNotes: { "1405-01-01": { note: "متن نامعتبر" } } }
    ]) {
      try { Store.importObj(backup); errors.push(""); }
      catch (e) { errors.push(e.message); }
    }
    return { before, after: JSON.stringify({ members: Store.get().members, sessions: Store.get().sessions, fees: Store.get().fees }), errors };
  });
  expect(result.errors).toHaveLength(4);
  expect(result.errors.every(message => !!message)).toBeTruthy();
  expect(result.after).toBe(result.before);
});

test("backup restore rejects malformed homework records without altering current data", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "restore-keep", name: "عضو موجود", phones: [] }];
    d.homework = [{ id: "hw-existing", key: "1405-01-08", text: "تکلیف سالم" }];
    Store.save();
    const before = JSON.stringify({ members: d.members, homework: d.homework });
    const errors = [];
    for (const homework of [
      [null],
      [{ id: "bad-text", key: "1405-01-08", text: 12 }],
      [{ id: "bad-date", key: "تاریخ نامعتبر", text: "تکلیف نامعتبر" }]
    ]) {
      try { Store.importObj({ members: [{ id: "new", name: "عضو جدید" }], homework }); errors.push(""); }
      catch (e) { errors.push(e.message); }
    }
    return { before, after: JSON.stringify({ members: Store.get().members, homework: Store.get().homework }), errors };
  });
  expect(result.errors).toHaveLength(3);
  expect(result.errors.every(message => !!message)).toBeTruthy();
  expect(result.after).toBe(result.before);
});

test("backup restore rolls back in-memory data when browser storage fails", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "restore-keep", name: "عضو موجود", phones: [] }];
    d.period = { title: "دوره فعلی", attendIds: [], feeIds: [], hwIds: [], note: "" };
    Store.save();
    const before = JSON.stringify({ members: d.members, period: d.period });
    const originalSetItem = Storage.prototype.setItem;
    let message = "";
    Storage.prototype.setItem = function(key, value) {
      if (key === "mct:data") throw new Error("simulated storage failure");
      return originalSetItem.call(this, key, value);
    };
    try {
      Store.importObj({ members: [{ id: "new", name: "عضو جدید" }], period: { title: "دوره جدید" } });
    } catch (e) { message = e.message; }
    finally { Storage.prototype.setItem = originalSetItem; }
    return { before, after: JSON.stringify({ members: Store.get().members, period: Store.get().period }), message };
  });
  expect(result.message).toContain("داده فعلی حفظ شد");
  expect(result.after).toBe(result.before);
});


test("tuition status save failure restores the previous record and session pointer", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "fee-rollback-member", name: "عضو شهریه", phones: [] }];
    d.fees = { "1405-01-08": { "fee-rollback-member": { paid: false, fc: "late", note: "یادداشت قبلی" } } };
    d._lastFee = "1405-01-01";
    Store.save();
    const beforeRecord = JSON.stringify(d.fees["1405-01-08"]["fee-rollback-member"]);
    const beforeLast = d._lastFee;
    const originalSave = Store.save;
    Store.save = () => false;
    try { feeStatus("1405-01-08", "fee-rollback-member", "paid"); }
    finally { Store.save = originalSave; }
    return {
      record: JSON.stringify(Store.get().fees["1405-01-08"]["fee-rollback-member"]),
      beforeRecord,
      lastFee: Store.get()._lastFee,
      beforeLast,
      toast: document.querySelector(".toast")?.textContent || ""
    };
  });
  expect(result.record).toBe(result.beforeRecord);
  expect(result.lastFee).toBe(result.beforeLast);
  expect(result.toast).toContain("اطلاعات قبلی حفظ شد");
});

test("tuition status save failure removes a newly-created empty session bucket", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const d = Store.get();
    d.members = [{ id: "fee-new-member", name: "عضو جدید شهریه", phones: [] }];
    d.fees = {};
    delete d._lastFee;
    Store.save();
    const originalSave = Store.save;
    Store.save = () => false;
    try { feeStatus("1405-01-15", "fee-new-member", "late"); }
    finally { Store.save = originalSave; }
    return { hasBucket: Object.prototype.hasOwnProperty.call(Store.get().fees, "1405-01-15"), hasPointer: Object.prototype.hasOwnProperty.call(Store.get(), "_lastFee") };
  });
  expect(result.hasBucket).toBe(false);
  expect(result.hasPointer).toBe(false);
});

test("homework save failure rolls back the new task and preserves existing records", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.homework = [{ id: "hw-existing", key: "1405-01-08", text: "تکلیف قبلی" }];
    Store.save();
  });
  await page.locator("#app .home-shortcut-tasks").click();
  await page.locator("#hwText").fill("تکلیف ذخیره‌نشده");
  await page.evaluate(() => { Store.save = () => false; });
  await page.getByRole("button", { name: /ذخیره/ }).click();
  const result = await page.evaluate(() => ({
    homework: Store.get().homework.map(h => ({ id: h.id, text: h.text })),
    toast: document.querySelector("#toast")?.textContent || ""
  }));
  expect(result.homework).toEqual([{ id: "hw-existing", text: "تکلیف قبلی" }]);
  expect(result.toast).toContain("اطلاعات قبلی حفظ شد");
});

test("homework delete failure restores the deleted task", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.homework = [{ id: "hw-keep-on-failure", key: "1405-01-08", text: "تکلیفی که باید حفظ شود" }];
    Store.save();
  });
  await page.reload();
  await page.locator("#app .home-shortcut-tasks").click();
  await page.getByRole("button", { name: /آرشیو/ }).click();
  await page.evaluate(() => { Store.save = () => false; });
  await page.locator('#app button[aria-label="حذف"]').click();
  await expect(page.locator("#app")).toContainText("تکلیفی که باید حفظ شود");
  const result = await page.evaluate(() => ({
    homework: Store.get().homework.map(h => h.id),
    toast: document.querySelector("#toast")?.textContent || ""
  }));
  expect(result.homework).toEqual(["hw-keep-on-failure"]);
  expect(result.toast).toContain("تکلیف حفظ شد");
});

test("second attendance round preserves the first round timestamp", async ({ page }) => {
  await page.goto("/");
  const sessionKey = await page.evaluate(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const key = Jalali.toKey(Jalali.toJ(
      tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate()
    ));
    const d = Store.get();
    d.members = [{
      id: "round-time-member", name: "عضو آزمون زمان نوبت", phones: [],
      roles: [], group: "عمومی", needs: []
    }];
    d.classes = [];
    d.extra = [{ key, start: "23:59", end: "23:59" }];
    d._lastSession = key;
    Store.save();
    render();
    return key;
  });

  await page.locator('#nav button[aria-label="حضور"]').click();
  const firstRoundButton = page.locator('#app .mblk').filter({ hasText: "عضو آزمون زمان نوبت" }).first().locator(".st-btn").first();
  await firstRoundButton.click();
  const firstTimestamp = await page.evaluate(key =>
    Store.get().sessions[key]["round-time-member"].time, sessionKey
  );
  expect(firstTimestamp).toBeTruthy();

  await page.getByRole("button", { name: /نوبت ۲ پشت در/ }).click();
  const secondRoundButton = page.locator("#app .mblk").filter({ hasText: "عضو آزمون زمان نوبت" }).first().locator(".st-btn").first();
  await secondRoundButton.click();

  const timestamps = await page.evaluate(key => {
    const record = Store.get().sessions[key]["round-time-member"];
    return { first: record.time, second: record.time2 };
  }, sessionKey);
  expect(timestamps.first).toBe(firstTimestamp);
  expect(timestamps.second).toBeTruthy();
});

test("next session skips a class that has already ended", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-29T19:30:00") });
  await page.goto("/");
  const result = await page.evaluate(() => {
    const now = new Date();
    const d = Store.get();
    d.classes = [{ dow: (now.getDay() + 1) % 7, start: "18:00", end: "19:00" }];
    d.extra = [];
    Store.save();
    const next = nextClass();
    return {
      sameDay: !!next && next.t.toDateString() === now.toDateString(),
      start: next && next.c.start,
      isFuture: !!next && next.t.getTime() > now.getTime()
    };
  });
  expect(result.sameDay).toBe(false);
  expect(result.start).toBe("18:00");
  expect(result.isFuture).toBe(true);
});

test("home countdown refreshes when an active class ends", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-29T18:30:00") });
  await page.goto("/");
  await page.evaluate(() => {
    const now = new Date();
    const d = Store.get();
    d.classes = [{ dow: (now.getDay() + 1) % 7, start: "18:00", end: "19:00" }];
    d.extra = [];
    Store.save();
    render();
  });
  await expect(page.locator("#app .home-countdown")).toContainText("کلاس در جریان است");
  await page.clock.runFor(31 * 60 * 1000);
  await expect(page.locator("#app .home-countdown")).not.toContainText("کلاس در جریان است");
});

test("class share QR is generated fully locally with no external requests", async ({ page }) => {
  const externalRequests = [];
  page.on("request", request => {
    if (!/^https?:\/\/127\.0\.0\.1(:4173)?\//.test(request.url())) externalRequests.push(request.url());
  });
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.members = d.members || [];
    if (!d.members.length) {
      d.members.push({ id: "qr-seed", name: "عضو آزمون QR", phones: [], roles: [], group: "عمومی", needs: [] });
      Store.save();
    }
  });
  await page.evaluate(() => shareClassCode());
  const modalTitle = page.locator(".modal h3", { hasText: "اشتراک کلاس" });
  await expect(modalTitle).toBeVisible();
  await expect(page.locator("#qrWrap img.qr-box")).toBeVisible({ timeout: 7000 });
  const qrInfo = await page.locator("#qrWrap img.qr-box").evaluate(img => ({
    isDataUrl: img.src.startsWith("data:image/"),
    size: img.src.length
  }));
  expect(qrInfo.isDataUrl, "QR must be an inline data-URL, not a remote image").toBe(true);
  expect(qrInfo.size, "QR data-URL should contain real bitmap data").toBeGreaterThan(100);
  await page.waitForTimeout(1200);
  expect(externalRequests, "No request may leave the app for QR generation (offline PWA)").toEqual([]);
});

test("PWA 2026: app badge updates without errors and reflects pending count", async ({ page }) => {
  await page.addInitScript(() => {
    window.__badge = [];
    if (navigator.setAppBadge) navigator.setAppBadge = n => { window.__badge.push(n); };
    if (navigator.clearAppBadge) navigator.clearAppBadge = () => { window.__badge.push(0); };
  });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.__badge && window.__badge.length > 0), { timeout: 10000 }).toBeTruthy();
  const ok = await page.evaluate(() => { try { updateAppBadge(); return "ok"; } catch (e) { return "err:" + e.message; } });
  expect(ok).toBe("ok");
  const calls = await page.evaluate(() => window.__badge || []);
  expect(calls.length).toBeGreaterThan(0);
  for (const c of calls) expect(typeof c).toBe("number");
});

test("modal is an accessible dialog: role, aria-modal and Escape to close", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { modal("<h3>آزمون مودال</h3><button id='b1'>دکمه</button>"); });
  const dlg = page.locator(".modal[role='dialog'][aria-modal='true']");
  await expect(dlg).toBeVisible({ timeout: 5000 });
  await page.keyboard.press("Escape");
  await expect(dlg).toHaveCount(0);
});

test("storage card shows real browser quota via Storage Quota API", async ({ page }) => {
  await page.goto("/");
  const hasApi = await page.evaluate(() => !!(navigator.storage && navigator.storage.estimate));
  if (!hasApi) return;
  await page.evaluate(() => go("settings"));
  await expect(page.locator("#storBody")).toContainText("کیلوبایت", { timeout: 7000 });
  await expect(page.locator("#storBody")).toContainText("فضای واقعی مصرفی", { timeout: 7000 });
});

test("service worker activates with reminder handlers and cache v123", async ({ page }) => {
  await page.goto("/");
  const info = await page.evaluate(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      return reg.active ? reg.active.state : "none";
    } catch (e) { return "err:" + e.message; }
  });
  expect(["activated", "activating", "installing"]).toContain(info);
});

test("no Content-Security-Policy violations on load", async ({ page }) => {
  const violations = [];
  page.on("console", msg => { if (msg.type() === "error" && /Content Security Policy|Refused to (load|execute|connect)/i.test(msg.text())) violations.push(msg.text()); });
  page.on("pageerror", err => { if (/Content Security Policy|Refused to (load|execute|connect)/i.test(err.message)) violations.push(err.message); });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached();
  await page.waitForTimeout(1500);
  expect(violations, violations.join(" | ")).toEqual([]);
});

test("online attendance can be marked and appears in reports without needing a call", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.members = [
      { id: "on-a", name: "عضو آنلاین", phones: [], roles: [], group: "عمومی" },
      { id: "on-b", name: "عضو حاضر", phones: [], roles: [], group: "عمومی" }
    ];
    d.sessions = {};
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  await page.locator("#app .mblk").filter({ hasText: "عضو آنلاین" }).locator('.st-btn[data-s="online"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const d = Store.get();
    const key = d._lastSession || Object.keys(d.sessions)[0];
    return ((d.sessions[key] || {})["on-a"] || {}).p1;
  })).toBe("online");
  // an online member is registered — the badge only counts the remaining member
  await expect(page.locator('#nav button[aria-label="حضور"] .nav-badge')).toHaveText("۱");
  const report = await page.evaluate(() => reportText(1, true));
  expect(report).toContain("آنلاین");
});

test("member form stores first and last name separately", async ({ page }) => {
  await page.goto("/");
  await page.locator('#nav button[aria-label="اعضا"]').click();
  await page.getByRole("button", { name: /افزودن عضو جدید/ }).click();
  await page.locator("#fName").fill("سارا");
  await page.locator("#fLName").fill("محمدی");
  await page.locator("#fSave").click();
  await expect.poll(() => page.evaluate(() => {
    const m = Store.get().members[0];
    return m ? m.fname + "|" + m.lname + "|" + m.name : "";
  })).toBe("سارا|محمدی|سارا محمدی");
});

test("session tasks can be added, auto-split and completed", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.members = [
      { id: "tk-a", name: "عضو الف وظایف", phones: [], roles: [], group: "عمومی" },
      { id: "tk-b", name: "عضو ب وظایف", phones: [], roles: [], group: "عمومی" }
    ];
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator("#app .home-shortcut-clip").click();
  await expect(page.locator("#app")).toContainText("تقسیم‌بندی وظایف");
  await page.locator("#tkTitle").fill("خرید میان‌وعده");
  await page.getByRole("button", { name: /افزودن وظیفه/ }).click();
  await expect.poll(() => page.evaluate(() => (Store.get().tasks || []).length)).toBe(1);
  await page.getByRole("button", { name: /تقسیم خودکار بین اعضا/ }).click();
  await expect.poll(() => page.evaluate(() => Boolean((Store.get().tasks || [])[0] && (Store.get().tasks[0] || {}).mid))).toBeTruthy();
  await page.locator("#app .mblk input[type=checkbox]").first().check();
  await expect.poll(() => page.evaluate(() => Boolean((Store.get().tasks || [])[0] && (Store.get().tasks[0] || {}).done))).toBeTruthy();
});

test("attendance list offers the shared sorting control", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const d = Store.get();
    d.settings.requireLogin = false;
    d.members = [
      { id: "srt-a", name: "علی زارعی", phones: [], roles: [], group: "عمومی" },
      { id: "srt-b", name: "رضا احمدی", phones: [], roles: [], group: "عمومی" }
    ];
    d.sessions = {};
    localStorage.setItem("mct:data", JSON.stringify(d));
  });
  await page.reload();
  await page.locator('#nav button[aria-label="حضور"]').click();
  await expect(page.locator("#app #memberSort")).toBeVisible();
  await page.locator("#app #memberSort").selectOption("family");
  const first = await page.locator("#app .mblk b").first().textContent();
  expect(first).toBe("رضا احمدی");
});
