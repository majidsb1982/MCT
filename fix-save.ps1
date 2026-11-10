$p='C:\Users\Pishgam-lift\Desktop\New folder\MCT\js\core.js'
$c=Get-Content $p -Raw -Encoding UTF8

# Use a simpler approach - find and replace line by line
$lines = $c -split "`r?`n"
$inSaveFunc = $false
$newLines = @()
$i = 0
while($i -lt $lines.Count){
  $line = $lines[$i]
  if($line.Trim() -eq 'const save=()=>{' -and -not $inSaveFunc){
    $inSaveFunc = $true
    # Replace the entire function
    $newLines += 'const save=()=>{'
    $newLines += '  try{'
    $newLines += '    const raw=JSON.stringify(data);'
    $newLines += '    const tempKey=KEY+":temp";'
    $newLines += '    localStorage.setItem(tempKey,raw);'
    $newLines += '    const verify=localStorage.getItem(tempKey);'
    $newLines += '    if(verify!==raw)throw new Error("Verify failed");'
    $newLines += '    localStorage.removeItem(KEY);'
    $newLines += '    localStorage.setItem(KEY,raw);'
    $newLines += '    localStorage.removeItem(tempKey);'
    $newLines += '    return true;'
    $newLines += '  }catch(e){'
    $newLines += '    console.error("MCT: Save failed",e);'
    $newLines += '    try{toastUx("⚠️ ذخیره‌سازی انجام نشد؛ فضای ذخیره یا دسترسی مرورگر را بررسی کنید","error");}catch(_){}'
    $newLines += '    return false;'
    $newLines += '  }'
    $newLines += '};'
    # Skip old function lines until we find the closing }; of the function
    $braceCount = 1
    $i++
    while($i -lt $lines.Count -and $braceCount -gt 0){
      $l = $lines[$i]
      $open = ($l -replace '[^{]', '').Length
      $close = ($l -replace '[^}]', '').Length
      $braceCount += $open - $close
      $i++
    }
    $inSaveFunc = $false
    continue
  }
  $newLines += $line
  $i++
}
$newContent = $newLines -join "`n"
if($c -ne $newContent){
  Set-Content $p $newContent -Encoding UTF8
  'DONE'
} else {
  'NO CHANGES'
}