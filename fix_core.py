import os
root = r"C:\Users\Pishgam-lift\Desktop\New folder\MCT"
core = os.path.join(root, "js", "core.js")
with open(core, 'r', encoding='utf-8') as f:
    lines = f.readlines()

bs = chr(92)   # backslash
sq = chr(39)   # single quote
dq = chr(34)   # double quote
nl = chr(10)   # newline

# Find esc line
for i, line in enumerate(lines):
    if 'const esc=s' in line and 'replace' in line:
        new_line = ('const esc=s=>String(s??'+dq+').replace(/[&<>'+dq+bs+']/g,c=>({' + dq + '&':'&amp;' + dq + ',' + dq + '<':'&lt;' + dq + ',' + dq + '>':'&gt;' + dq + ',' + dq + bs + sq + ':' + dq + '&quot;' + dq + ',' + dq + bs + sq + ':' + dq + '&#39;' + dq + '}[c]));' + nl +
        'const escAttr=s=>String(s??'+dq+').replace(/[&<>'+dq+bs+sq+'\\/]/g,c=>({' + dq + '&':'&amp;' + dq + ',' + dq + '<':'&lt;' + dq + ',' + dq + '>':'&gt;' + dq + ',' + dq + bs + ':' + dq + '&quot;' + dq + ',' + dq + bs + sq + ':' + dq + '&#39;' + dq + '}));' + nl +
        'const escJs=s=>String(s??'+dq+').replace(/[' + bs + dq + sq + bs + '`\n\r\t]/g,c=>({' + dq + bs + bs + ':' + dq + bs + bs + bs + bs + dq + ',' + dq + dq + ':' + dq + bs + bs + dq + dq + ',' + dq + bs + sq + ':' + dq + bs + bs + sq + dq + ',' + dq + bs + '`' + ':' + dq + bs + bs + bs + '`' + dq + ',' + dq + bs + 'n' + ':' + dq + bs + 'n' + dq + ',' + dq + bs + 'r' + ':' + dq + bs + 'r' + dq + ',' + dq + bs + 't' + ':' + dq + bs + 't' + dq + '}));' + nl +
        'const safeHtml=s=>String(s??'+dq+').replace(/<(?!\/(b|i|u|br)\b)[^>]*>/g,' + dq + ');')
        lines[i] = new_line + nl
        print("OK: esc functions replaced at line", i+1)
        break

with open(core, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("core.js esc fix done")