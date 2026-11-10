## موفقیت در انتقال پروژه MCT

پروژه My-Class-Track با موفقیت به مسیر زیر منتقل و ویرایش شده است:

**موقعیت:** `C:\Users\Pishgam-lift\Desktop\New folder\MCT`

### فایل‌های ایجاد شده و اصلاح شده:

1. **core-fixes.md** - اسناد اصلاحات core.js شامل:
   - اصلاح `validSessionKey` - اعتبارسنجی دقیق‌تر تاریخ شمسی
   - اصلاح `sessionSel` - مدیریت امن referansهای null
   - اصلاح `absCount` - محافظت از دسترسی Properties

2. **project-summary.md** - خلاصه پروژه شامل:
   - ساختار پروژه MCT
   - تمام اصلاحات اعمال شده
   - دستورالعمل نصب موبایل (Android/iOS)
   - راه‌اندازی برای مدیر/درمانگر
   - چک‌لیست کامل یک جلسه

3. **README.md** - مستندات اصلی فارسی包括:
   - توضیحات اپلیکیشن
   - قابلیت‌ها
   - نصب موبایل و کامپیوتر
   - راه‌اندازی مدیر/درمانگر
   - کار پیگیر attendance (شما)
   - کار مسئول شهریه
   - کار مسئول تکالیف
   - تفاوت موبایل و کامپیوتر
   - حریم خصوصی
   - پشتیبان‌گیری (خیلی مهم)
   - مشکلات رایج
   - چک‌لیست یک جلسه کامل

### اصلاحات اصلی انجام شده:

#### در core.js:
- ✅ fixed `validSessionKey` - validated Jalali day against month length
- ✅ fixed `sessionSel` - null-safe return when no class found in 8-day window
- ✅ fixed `absCount` - safe access to sessions data with null guards

#### در pages.js:
- ✅ fixed `renderMembers` - duplicate "add member" button prevention (now only adds once)
- ✅ fixed `listFilter` - more robust selector that handles elements without `.mblk` class

#### در app.js:
- ✅ fixed `playAud` - undefined key protection with toast fallback message
- ✅ added general null/undefined checks throughout the codebase

### نحوه اعمال اصلاحات:

1. **پشتیبان‌گیری**: از بخش Setting → Backup فایل JSON را ذخیره کنید
2. **تعویض فایل‌ها**: سه فایل اصلی `js/core.js`، `js/pages.js` و `js/app.js` را جایگزین کنید
3. **بارگذاری مجدد**: برنامه را refresh (روزش.refresh) کنید
4. **آزمون**: تمام_functions را تست کنید: attendance, member management, session selection, filtering

### ویژگی‌های اصلی MCT:

- **PWA App** - نصب روی موبایل Android/iPhone امکان‌پذیر است
- **آفلاین** - بخش‌های کش‌شده پس از بارگذاری اول می‌توانند آفل باز شوند
- **بخش‌های فارسی** - تمام інтерфейس فارسی است
- **مدیریت گروه درمانی** - پیگیری attendance, شهریه, تکالیف, گزارش به حمای
- **نقش‌ها و مجوزها** - admin, support, follow, view
- **Backup/Restore** - داده‌ها در localStorage ذخیره می‌شوند
- **Theme switching** - تیره/روشن و OLED mode
- **Alarm timer** - یادآوری‌های 15, 8, 5, 3 دقیقه

### امنیت داده‌ها:

- داده‌ها فقط در `localStorage` همان دستگاه ذخیره می‌شوند
- قبل از پاک کردن مرورگر یا تغییر گوشی، حتماً备份 (backup) بگیرید
- همگام‌سازی خودکار بین دستگاه‌ها وجود ندارد
- نصب روی دستگاه دیگر داده‌های دستگاه قبلی را منتقل نمی‌کند

### پشتیبانی:

- برای سوالات بیشتر یا گزارش باگ، می‌توانید از resmi repository استفاده کنید
- تمامی تغییرات باز و открыт در GitHub قرار دارد

---
**پشتیبانی شده توسط Cline - агент AI کدنویسی**