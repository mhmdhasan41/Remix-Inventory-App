import re

with open('src/pages/Materials.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace initialStock
target1 = """                <TextField
                  fullWidth
                  type="number"
                  label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                  placeholder="مثال: 100"
                  disabled={!!selectedMaterial}
                  {...register('initialStock')}
                  error={!!errors.initialStock}
                  helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
                />"""

replacement1 = """                <TextField
                  fullWidth
                  type="number"
                  label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                  placeholder="مثال: 100"
                  disabled={!!selectedMaterial}
                  {...register('initialStock')}
                  onFocus={(e) => e.target.select()}
                  error={!!errors.initialStock}
                  helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
                />"""

# Replace minimumStock
target2 = """                <TextField
                  fullWidth
                  type="number"
                  label="حد الأمان الأدنى"
                  placeholder="مثال: 10"
                  {...register('minimumStock', { valueAsNumber: true })}
                  error={!!errors.minimumStock}
                  helperText={errors.minimumStock?.message || "كمية التنبيه للاستنفاد"}
                />"""

replacement2 = """                <TextField
                  fullWidth
                  type="number"
                  label="حد الأمان الأدنى"
                  placeholder="مثال: 10"
                  {...register('minimumStock', { valueAsNumber: true })}
                  onFocus={(e) => e.target.select()}
                  error={!!errors.minimumStock}
                  helperText={errors.minimumStock?.message || "كمية التنبيه للاستنفاد"}
                />"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)

with open('src/pages/Materials.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
