import os
root = r"C:\Users\Pishgam-lift\Desktop\New folder\MCT"
core = os.path.join(root, "js", "core.js")
with open(core, 'r', encoding='utf-8') as f:
    c = f.read()
old = 'const esc=s=>String(s??\"\").replace(/[&<>\"\\']/g,c=>({'
if old in c:
    new = old + '''
const escAttr=s=>String(s??\"\").replace(/[&<>\"\\'/]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\":"&quot;","\\'":"&#39;"}));
const escJs=s=>String(s??\"\").replace(/[\\\\\"\\'`\\n\\r\\t]/g,c=>({"\\\\":"\\\\\\\\","\\":"\\\\\\"","\\'":"\\\\\\'",`:"\\\\\\`","\\n":"\\\\n","\\r":"\\\\r","\\t":"\\\\t"}));
const safeHtml=s=>String(s??\"\").replace(/<(?!\/?(b|i|u|br)\\b)[^>]*>/g,"");'''
    c = c.replace(old, new, 1)
    with open(core, 'w', encoding='utf-8') as f:
        f.write(c)
    print("OK: esc functions added")
else:
    print("SKIP: esc pattern not found")