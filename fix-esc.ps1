$p='C:\Users\Pishgam-lift\Desktop\New folder\MCT\js\core.js'
$c=Get-Content $p -Raw -Encoding UTF8

# Find the esc function line
$escLine = 'const esc=s=>String(s??\"\").replace(/[&<>\"']/g,c=>({'
$newEsc = @'
const esc=s=>String(s??\"\").replace(/[&<>\"'`]/g,c=>({"&":"&","<":"<",">":">","\"":""","'":"'","`":"&#96;"}[c]));
const escAttr=s=>esc(String(s??\"\")).replace(/\"/g,""");
const escJs=s=>String(s??\"\").replace(/[\\"'`\n\r\t]/g,c=>({"\\":"\\\\","\"":"\\\"","'":"\'","`":"\`","\n":"\n","\r":"\r","\t":"\t"}[c]));
const safeHtml=s=>String(s??\"\").replace(/<(?!\/?(b|i|u|br)\b)[^>]*>/g,"");
'@

if($c.Contains($escLine)){
    $c=$c.Replace($escLine,$newEsc)
    Set-Content $p $c -Encoding UTF8
    'DONE: esc function updated'
} else {
    'NOT FOUND: esc line pattern changed'
}