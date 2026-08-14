import sys

file_path = "src/pages/Transactions.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "const getSupplierOrReceiverLabel = (txType: string, transferType?: string) => {"
replacement = "const getSupplierOrReceiverLabel = (txType: string) => {"

if target in content:
    content = content.replace(target, replacement)
    print("label replaced")
else:
    print("label not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
