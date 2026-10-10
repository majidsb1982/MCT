# گیت‌هاب و استقرار MCT v21

## ساختار کامل ریپو

```
index.html
css/app.css
js/core.js      # هسته
js/pages.js     # صفحات
js/app.js       # روتینگ و قابلیت‌ها
sw.js
manifest.webmanifest
icon.svg
README.md
GUIDE.md
GUIDE.html
.gitignore
```

## نصب روی گیت‌هاب (یک‌بار)

1. بسته `MCT-v21.zip` را از پروژه دانلود و Extract کنید
2. در https://github.com/majidsb1982/MCT → **Add file → Upload files**
3. همه فایل‌ها و پوشه‌های `css/` و `js/` را بکشید روی صفحه
4. Commit message: `release: v21 complete`

## GitHub Pages

1. https://github.com/majidsb1982/MCT/settings/pages
2. Source: Deploy from a branch
3. Branch: `main` / folder: `/ (root)`
4. آدرس: **https://majidsb1982.github.io/MCT/**

بعد از هر آپدیت روی موبایل Hard Refresh کنید.

## ترتیب بارگذاری JS

`core.js` → `pages.js` → `app.js` (عوض نشود)

## نکته

فایل‌های JS بزرگ هستند؛ آپلود از رابط وب GitHub مطمئن‌ترین روش است.
