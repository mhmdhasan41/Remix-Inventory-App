import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

bad_block = """          if (txTypeStr !== "وارد" && txTypeStr !== "صادر" && txTypeStr !== "مستهلك" && txTypeStr !== "تحويل" && txTypeStr !== "تسوية" && txTypeStr !== "افتتاحي") {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: نوع الحركة غير معروف`);
            continue;
          }
            skippedCount++;
          }"""

good_block = """          if (txTypeStr !== "وارد" && txTypeStr !== "صادر" && txTypeStr !== "مستهلك" && txTypeStr !== "تحويل" && txTypeStr !== "تسوية" && txTypeStr !== "افتتاحي") {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: نوع الحركة غير معروف`);
            continue;
          }"""

if bad_block in content:
    content = content.replace(bad_block, good_block)
    print("Replaced syntax error successfully!")
else:
    print("Could not find the syntax error block.")

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)
