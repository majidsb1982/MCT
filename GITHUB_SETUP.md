# تمیزکاری و استقرار گیت‌هاب — MCT

## ساختار ریشه ریپو

```
MCT/
├── README.md
├── .gitignore
├── index.html
├── sw.js
├── manifest.webmanifest
├── icon.svg
├── GUIDE.html
└── GUIDE.md
```

ZIPهای قدیمی را در ریشه نگذارید؛ در Releases با تگ نسخه بگذارید.

## GitHub Pages

1. https://github.com/majidsb1982/MCT/settings/pages
2. Source: Deploy from a branch
3. Branch: main ، folder: / (root)
4. آدرس: https://majidsb1982.github.io/MCT/

## به‌روزرسانی از ZIP محلی

محتویات `MCT-v18.zip` را روی ریشه ریپو آپلود یا با git push بفرستید.

```bash
git clone https://github.com/majidsb1982/MCT.git
cd MCT
# کپی فایل‌های نسخه ۱۸
git add .
git commit -m "release: v18"
git push
```

بعد از انتشار، روی موبایل Hard Refresh کنید.
