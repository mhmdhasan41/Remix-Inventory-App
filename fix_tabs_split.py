import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def extract_jsx_block(text, start_str):
    start_idx = text.find(start_str)
    if start_idx == -1: return None, -1, -1
    idx = start_idx + len(start_str)
    brace_count = 1
    in_string = False
    string_char = ''
    while idx < len(text) and brace_count > 0:
        c = text[idx]
        if in_string:
            if c == string_char and text[idx-1] != '\\':
                in_string = False
        else:
            if c in ["'", '"', '`']:
                in_string = True
                string_char = c
            elif c == '(':
                brace_count += 1
            elif c == ')':
                brace_count -= 1
        idx += 1
    # include the following }
    if idx < len(text) and text[idx] == '}':
        idx += 1
    return text[start_idx:idx], start_idx, idx

old_tab0, s0, e0 = extract_jsx_block(content, "{activeTab === 0 && (")

print(old_tab0[:200])
print(old_tab0[-200:])

cat_idx = old_tab0.find("{/* Categories management Card */}")
if cat_idx != -1:
    print(f"Categories found at {cat_idx}")
    
