import re

with open('src/utils/printHtml.ts', 'r') as f:
    content = f.read()

content = content.replace("margin-top: auto;", "margin-top: 40px;")

with open('src/utils/printHtml.ts', 'w') as f:
    f.write(content)
print("done")
