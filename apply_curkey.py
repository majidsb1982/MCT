import os
root = r"C:\Users\Pishgam-lift\Desktop\New folder\MCT"
core = os.path.join(root, "js", "core.js")
rep = os.path.join(root, "curkey_replacement.txt")

with open(rep, 'r', encoding='utf-8') as f:
    new_text = f.read().rstrip('\n')

with open(core, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip().startswith('function curKey()'):
        lines[i] = new_text + '\n'
        print(f"Replaced curKey at line {i+1}")
        break

with open(core, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done")