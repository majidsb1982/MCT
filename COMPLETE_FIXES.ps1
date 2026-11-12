# ============================================================
# MCT - COMPLETE CRITICAL FIXES & UPGRADES (PART 1)
# Run: powershell -ExecutionPolicy Bypass -File COMPLETE_FIXES.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$root = "C:\Users\Pishgam-lift\Desktop\New folder\MCT"
$js = Join-Path $root "js"

Write-Host "=== MCT COMPLETE FIXES & UPGRADES ===" -ForegroundColor Cyan

function Update-File {
    param($path, $old, $new)
    $content = Get-Content $path -Raw -Encoding UTF8
    if ($content.Contains($old)) {
        $content = $content.Replace($old, $new)
        Set-Content $path $content -Encoding UTF8
        Write-Host "  ✓ Updated: $path" -ForegroundColor Green
        return $true
    }
    Write-Host "  ⚠ Pattern not found: $path" -ForegroundColor Yellow
    return $false
}

function Add-To-File {
    param($path, $marker, $content, $after = $true)
    $text = Get-Content $path -Raw -Encoding UTF8
    if ($text.Contains($marker)) {
        if ($after) { $text = $text.Replace($marker, $marker + "`n`n" + $content) }
        else { $text = $text.Replace($marker, $content + "`n`n" + $marker) }
        Set-Content $path $text -Encoding UTF8
        Write-Host "  ✓ Added after marker: $path" -ForegroundColor Green
        return $true
    }
    Write-Host "  ⚠ Marker not found: $path" -ForegroundColor Yellow
    return $false
}

Write-Host "`n=== [1/7] Creating core.js patches ===" -ForegroundColor Cyan
$core = Join-Path $js "core.js"

# ============================================================
# CORE.JS - LIFECYCLE + PIN HASHING + SESSION CACHE
# ============================================================
$lifecycleCode = @"
// ============ Lifecycle Management + PIN Hashing + Session Cache ============
const MCT_LIFECYCLE = { listeners: [], blobs: [], timers: [], abortControllers: [] };
function on(event, handler, options) { window.addEventListener(event, handler, options); MCT_LIFECYCLE.listeners.push({ target: window, event, handler, options }); }
function onEl(el, event, handler, options) { el.addEventListener(event, handler, options); MCT_LIFECYCLE.listeners.push({ target: el, event, handler, options }); }
function trackBlob(url) { if (url) MCT_LIFECYCLE.blobs.push(url); }
function untrackBlob(url) { const i = MCT_LIFECYCLE.blobs.indexOf(url); if (i >= 0) { MCT_LIFECYCLE.blobs.splice(i, 1); URL.revokeObjectURL(url); } }
function trackTimer(id) { MCT_LIFECYCLE.timers.push(id); }
function clearAllTimers() { MCT_LIFECYCLE.timers.forEach(clearTimeout); MCT_LIFECYCLE.timers = []; }
function cleanupAll() {
  MCT_LIFECYCLE.listeners.forEach(l => { try { l.target.removeEventListener(l.event, l.handler, l.options); } catch (e) {} });
  MCT_LIFECYCLE.listeners = [];
  MCT_LIFECYCLE.blobs.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} });
  MCT_LIFECYCLE.blobs = [];
  clearAllTimers();
  MCT_LIFECYCLE.abortControllers.forEach(c => c.abort());
  MCT_LIFECYCLE.abortControllers = [];
}
window.addEventListener("beforeunload", cleanupAll);
window.addEventListener("pagehide", cleanupAll);

// Session key cache (5s TTL to prevent race conditions)
let _sessionKeyCache = { key: null, ts: 0 };
function curKey() {
  const now = Date.now();
  if (_sessionKeyCache.key && now - _sessionKeyCache.ts < 5000) return _sessionKeyCache.key;
  const nc = nextClass();
  const key = nc ? Jalali.toKey(nc.date) : null;
  _sessionKeyCache = { key, ts: now };
  return key;
}
function sessionSel() {
  const d = Store.get();
  const storedKey = d._lastSession;
  if (storedKey && validSessionKey(storedKey)) {
    const known = storedKey === curKey() ||
      Object.prototype.hasOwnProperty.call(d.sessions || {}, storedKey) ||
      Object.prototype.hasOwnProperty.call(d.fees || {}, storedKey) ||
      (Array.isArray(d.homework) && d.homework.some(h => h && h.key === storedKey));
    if (known) return storedKey;
  }
  return curKey();
}

// ============ PIN Hashing (PBKDF2-SHA256) ============
const PIN_ITER = 60000;
const randSalt = () => {
  const a = new Uint8Array(16);
  (self.crypto || window.crypto).getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, "0")).join("");
};
async function hashPin(pin, saltHex, iter = PIN_ITER) {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, keyMaterial, 256);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) { console.error("hashPin failed", e); return null; }
}
async function verifyPin(pin, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [iter, salt, hash] = stored.split(":");
  const computed = await hashPin(pin, salt, parseInt(iter));
  return computed === hash;
}
"