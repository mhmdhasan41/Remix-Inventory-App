import re

with open('src/utils/printHtml.ts', 'r') as f:
    content = f.read()

# Fix signatures CSS in exportToPDF
old_sig_css = """        .signature-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .signature-role {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }

        .signature-name {
          font-size: 13px;
          font-weight: 700;
          color: #00557f;
          border-top: 1px dashed #cbd5e1;
          padding-top: 10px;
          width: 80%;
        }"""
new_sig_css = """        .signature-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }"""
content = content.replace(old_sig_css, new_sig_css)

# Also fix td to avoid wrapping for code column. Wait, how do we target code column?
# The code is generated in table rows, maybe we can just add a utility class or we can make cells that contain DEV- or OP- no wrap.
# Alternatively, we can use CSS `td { word-break: break-word; }` and for specific short strings, we can use no-wrap, or we can just apply `white-space: nowrap;` to specific columns based on index, but the index varies depending on report type.
# But `table` is `width: 100%`. If some columns are short, we shouldn't force them.

with open('src/utils/printHtml.ts', 'w') as f:
    f.write(content)
print("done")
