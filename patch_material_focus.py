import sys

file_path = "src/components/MaterialFormDialog.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                {...register('initialStock')}
                error={!!errors.initialStock}
                helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
              />"""

replacement = """                {...register('initialStock')}
                error={!!errors.initialStock}
                helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
                onFocus={(e) => e.target.select()}
              />"""

if target in content:
    content = content.replace(target, replacement)
    print("focus replaced")
else:
    print("focus not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
