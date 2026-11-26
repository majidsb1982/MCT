#!/usr/bin/env bash
# MCT — انتشار برنامه روی مخزن + commit + push
# اجرا:  bash install.sh   (یا با مسیر مخزن:  bash install.sh ~/MCT/MCT)
#
# منبع یکتای برنامه، همان پوشه‌ای است که install.sh در آن قرار دارد (ریشهٔ زیپ).
# اسکریپت فقط فایل‌های اجرایی برنامه را روی مخزن می‌ریزد و پیش از آن نسخهٔ کش (?v=)
# را کنترل می‌کند تا زیپ قدیمی‌تر از مخزن، نسخهٔ منتشرشده را عقب نبرد.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"

# تنها چیزهایی که از پوشهٔ برنامه روی مخزن منتشر می‌شوند.
# اگر برنامه فایل یا پوشهٔ تازه‌ای در ریشه لازم داشت، همین‌جا اضافه شود.
APP_ITEMS="index.html sw.js manifest.webmanifest icon.svg icon-192.svg icon-512.svg README.md css fonts icons js screenshots"

cache_version(){
  grep -o '?v=[0-9]\+' "$1" 2>/dev/null | head -1 | tr -dc '0-9'
}

[ -f "$HERE/index.html" ] || {
  echo "✗ index.html کنار install.sh نیست — زیپ باید کل ریشهٔ پروژه باشد، نه فقط install.sh."
  exit 1
}

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
cd "$REPO" || exit 1
REPO="$(pwd)"
echo "✓ مخزن: $REPO"

# ---- ۲) همگام‌سازی با گیت‌هاب ----
echo "→ git pull ..."
if ! git pull --ff-only 2>&1 | tail -1; then
  echo "✗ pull نشد — اینترنت را چک کن. (اگر تغییر داده‌نشده محلی داری: git stash ، بعد دوباره install.sh)"
  exit 1
fi

# ---- ۳) مخزن باید تمیز باشد تا انتشار فقط همین بسته را داشته باشد ----
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ مخزن تغییر commitنشده دارد — انتشار متوقف شد."
  echo "  تغییرات را commit یا stash کن و دوباره اجرا کن:  git status"
  exit 1
fi

# ---- ۴) کنترل نسخهٔ بسته ----
ZVER="$(cache_version "$HERE/index.html")"
RVER="$(cache_version "index.html")"
if [ -z "$ZVER" ] || [ -z "$RVER" ]; then
  echo "✗ نسخهٔ کش (?v=) در index.html پیدا نشد — بستهٔ ناقص است."
  exit 1
fi
if [ "$ZVER" -lt "$RVER" ]; then
  echo "✗ زیپ (v$ZVER) از مخزن (v$RVER) قدیمی‌تر است؛ برای جلوگیری از برگشت نسخه متوقف شد."
  echo "  زیپ را از ریشهٔ به‌روز پروژه دوباره بساز."
  exit 1
fi
echo "✓ نسخهٔ بسته v$ZVER — نسخهٔ مخزن v$RVER"

# ---- ۵) کپی فایل‌های برنامه روی مخزن ----
copy_app(){
  for item in $APP_ITEMS; do
    if [ -d "$HERE/$item" ]; then
      rm -rf "$REPO/$item" || return 1
      cp -R "$HERE/$item" "$REPO/$item" || return 1
    elif [ -f "$HERE/$item" ]; then
      cp "$HERE/$item" "$REPO/$item" || return 1
    else
      echo "✗ «$item» در پوشهٔ install.sh نیست — زیپ ناقص است."
      return 1
    fi
  done
}

if [ "$HERE" = "$REPO" ]; then
  echo "• install.sh داخل خود مخزن اجرا شد — فایلی برای کپی نبود."
elif ! copy_app; then
  git reset --hard -q HEAD
  git clean -qfd
  echo "✗ کپی کامل نشد؛ تغییرات نیمه‌کاره برگشت داده شد."
  exit 1
fi

git add -A
echo "---- فایل‌های stage شده ----"
git status --short
echo "----------------------------"

# ---- ۶) commit ----
if git config user.email >/dev/null 2>&1 && git config user.name >/dev/null 2>&1; then
  :
else
  git config user.email "majidsb1982@users.noreply.github.com"
  git config user.name  "majidsb1982"
fi
if git diff --cached --quiet; then
  echo "• هیچ چیزی برای پوش نبود (همه فایل‌ها از قبل همین بودند)."
  exit 0
fi
if ! git commit -m "release: publish app shell (cache v$ZVER)"; then
  echo "✗ commit نشد — خروجی بالا را بفرست."
  exit 1
fi

# ---- ۷) push ----
if [ "${MCT_NO_PUSH:-0}" = "1" ]; then
  echo "• MCT_NO_PUSH=1 است — push انجام نشد (فقط تست محلی)."
  exit 0
fi
echo "→ git push ..."
if git push; then
  echo ""
  echo "✅ تمام شد! نسخهٔ v$ZVER پوش شد."
  echo "   ۲-۳ دقیقه صبر کن (Actions سبز شود)، بعد سایت را با کش جدید (Ctrl+F5 / کش پاک) باز کن."
else
  echo "✗ push نشد — توکن منقضی شده یا اینترنت قطع است."
  echo "  دوباره امتحان کن:  cd $REPO && git push"
fi
