#!/usr/bin/env bash
# MCT v122 — نصب یک‌جای همه فایل‌ها + commit + push
# اجرا:  bash install.sh   (یا با مسیر مخزن:  bash install.sh ~/MCT/MCT)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
FILES="$HERE/files"
[ -d "$FILES" ] || { echo "✗ پوشه files کنار install.sh نیست — زیپ را کامل باز کن."; exit 1; }

# ---- ۱) پیدا کردن مخزن MCT ----
REPO="${1:-}"
if [ -z "$REPO" ]; then
  for d in "$HOME/MCT/MCT" "$HOME/MCT" "$HOME/mct/MCT" "$HOME/mct" "$HOME/storage/shared/MCT/MCT"; do
    if [ -f "$d/sw.js" ] && [ -d "$d/.git" ]; then REPO="$d"; break; fi
  done
fi
if [ -z "$REPO" ] || [ ! -f "$REPO/sw.js" ] || [ ! -d "$REPO/.git" ]; then
  echo "✗ مخزن MCT پیدا نشد."
  echo "  مسیر درست را بده، مثلا:  bash install.sh ~/MCT/MCT"
  exit 1
fi
echo "✓ مخزن: $REPO"
cd "$REPO"

# ---- ۲) همگام‌سازی با گیت‌هاب ----
echo "→ git pull ..."
if ! git pull --ff-only 2>&1 | tail -1; then
  echo "✗ pull نشد — اینترنت را چک کن. (اگر تغییر داده‌نشده محلی داری: git stash ، بعد دوباره install.sh)"
  exit 1
fi

# ---- ۳) کپی ۱۵ فایل (۱۳ فایل v122 + اصلاح CI) ----
cp -r "$FILES/." "$REPO/"
git add -A
echo "---- فایل‌های stage شده ----"
git status --short
echo "----------------------------"

# ---- ۴) commit ----
# اگر هویت گیت تنظیم نبود، خودکار بگذار (فقط برای همین مخزن)
git config user.email >/dev/null 2>&1 || git config user.email "majidsb1982@users.noreply.github.com"
git config user.name  >/dev/null 2>&1 || git config user.name  "majidsb1982"
if git diff --cached --quiet; then
  echo "• هیچ چیزی برای پوش نبود (همه فایل‌ها از قبل همین بودند)."
  exit 0
fi
if ! git commit -m "v123: badge follows active round, split first/last name, global sorting, session tasks with auto-split, online attendance"; then
  echo "✗ commit نشد — خروجی بالا را بفرست."
  exit 1
fi

# ---- ۵) push ----
if [ "${MCT_NO_PUSH:-0}" = "1" ]; then
  echo "• MCT_NO_PUSH=1 است — push انجام نشد (فقط تست محلی)."
  exit 0
fi
echo "→ git push ..."
if git push; then
  echo ""
  echo "✅ تمام شد! v122 روی گیت‌هاب پوش شد."
  echo "   ۲-۳ دقیقه صبر کن (Actions سبز شود)، بعد سایت را با کش جدید (Ctrl+F5 / کش پاک) باز کن."
else
  echo "✗ push نشد — توکن منقضی شده یا اینترنت قطع است."
  echo "  دوباره امتحان کن:  cd $REPO && git push"
fi
