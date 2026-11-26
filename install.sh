#!/usr/bin/env bash
# MCT — انتشار بستهٔ files/ روی مخزن + commit + push
# اجرا:  bash install.sh   (یا با مسیر مخزن:  bash install.sh ~/MCT/MCT)
#
# منبع یکتای برنامه، ریشهٔ مخزن است؛ پوشهٔ files/ با «node scripts/sync-files.js»
# ساخته می‌شود و CI هم همگام‌بودن آن را بررسی می‌کند. این اسکریپت پیش از انتشار
# سنخ نسخه را کنترل می‌کند تا زیپ قدیمی، نسخهٔ جدیدتر مخزن را عقب نبرد.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
FILES="$HERE/files"
[ -d "$FILES" ] || { echo "✗ پوشهٔ files کنار install.sh نیست — زیپ را کامل باز کن."; exit 1; }

cache_version(){
  grep -o '?v=[0-9]\+' "$1" 2>/dev/null | head -1 | tr -dc '0-9'
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
echo "✓ مخزن: $REPO"
cd "$REPO" || exit 1

# ---- ۲) همگام‌سازی با گیت‌هاب ----
echo "→ git pull ..."
if ! git pull --ff-only 2>&1 | tail -1; then
  echo "✗ pull نشد — اینترنت را چک کن. (اگر تغییر داده‌نشده محلی داری: git stash ، بعد دوباره install.sh)"
  exit 1
fi

# ---- ۳) مخزن باید تمیز باشد تا انتشار فقط همان بسته را داشته باشد ----
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ مخزن تغییر commitنشده دارد — انتشار متوقف شد."
  echo "  تغییرات را commit یا stash کن و دوباره اجرا کن:  git status"
  exit 1
fi

# ---- ۴) کنترل نسخهٔ بسته ----
ZVER="$(cache_version "$FILES/index.html")"
RVER="$(cache_version "index.html")"
if [ -z "$ZVER" ] || [ -z "$RVER" ]; then
  echo "✗ نسخهٔ کش (?v=) در index.html پیدا نشد — بستهٔ ناقص است."
  exit 1
fi
if [ "$ZVER" -lt "$RVER" ]; then
  echo "✗ زیپ (v$ZVER) از مخزن (v$RVER) قدیمی‌تر است؛ برای جلوگیری از برگشت نسخه متوقف شد."
  echo "  زیپ تازه بساز:  node scripts/sync-files.js   سپس بسته را از نو ببند."
  exit 1
fi
echo "✓ نسخهٔ بسته v$ZVER — نسخهٔ مخزن v$RVER"

# ---- ۵) کپی بسته روی مخزن ----
cp -r "$FILES/." "$REPO/"
git add -A
echo "---- فایل‌های stage شده ----"
git status --short
echo "----------------------------"

# ---- ۶) بازسازی کپی files/ و بررسی همگام‌بودن ----
# فایل‌های files/ در مخزن هم نگهداری می‌شوند؛ پس در همان commit از ریشه بازسازی می‌شوند
# تا هیچ‌وقت دو نسخه از برنامه در مخزن نماند.
if command -v node >/dev/null 2>&1 && [ -f scripts/sync-files.js ]; then
  node scripts/sync-files.js || { git reset --hard -q HEAD; git clean -qfd; exit 1; }
  git add -A
  if ! node scripts/sync-files.js --check; then
    echo "✗ بستهٔ files/ با ریشهٔ مخزن همگام نیست — انتشار متوقف شد و تغییرات برگشت داده شد."
    git reset --hard -q HEAD; git clean -qfd
    exit 1
  fi
else
  echo "• node یا scripts/sync-files.js در دسترس نیست؛ بازسازی و بررسی files/ انجام نشد."
fi

# ---- ۷) commit ----
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

# ---- ۸) push ----
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
