$ErrorActionPreference = "Stop"
$p = "C:\Users\Pishgam-lift\Desktop\New folder\MCT\js\core.js"
$c = Get-Content $p -Raw -Encoding UTF8

# 1. Fix esc function - add escAttr, escJs, safeHtml
$oldEsc = 'const esc=s=>String(s??\"\").replace(/[&<>\"'\''\''\']/g,c=>({'
$newEsc = 'const esc=s=>String(s??\"\").replace(/[&<>\"'\''\''\']/g,c=>({' + "`n" + '  "&":"&amp;","<":"&lt;",">":"&gt;","\'":"&#39;"' + "`n" + '}));' + "`n" + 'const escAttr=s=>String(s??\"\").replace(/[&<>\"\''\''\/]/g,c=>({" + "`n" + '  "&":"&amp;","<":"&lt;",">":"&gt;","\'":"&#39;"' + "`n" + '}));' + "`n" + 'const escJs=s=>String(s??\"\").replace(/[\\\\\'\''\''\'\\\`\n\r\t]/g,c=>({" + "`n" + '  "\\":"\\\\","\'":"\\\'","`":"\\\`","\n":"\\n","\r":"\\r","\t":"\\t"' + "`n" + '}));' + "`n" + 'const safeHtml=s=>String(s??\"\").replace(/<(?!\/(b|i|u|br)\b)[^>]*>/g,"");'

Write-Host "Old esc found: $($c.Contains($oldEsc))"

if ($c.Contains($oldEsc)) {
    $c = $c.Replace($oldEsc, $newEsc)
    Set-Content $p $c -Encoding UTF8
    Write-Host "SUCCESS: esc functions updated"
} else {
    Write-Host "FAILED: esc pattern not found"
    # Show what's actually on line 299
    $lines = Get-Content $p
    $lines[298] | Write-Host
}