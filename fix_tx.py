with open('src/components/CreateTransactionModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double onFocus
content = content.replace("onFocus={(e) => e.target.select()}\n                error={!!errors.quantity}\n                helperText={errors.quantity?.message}\n                onFocus={(e) => e.target.select()}", 
                          "onFocus={(e) => e.target.select()}\n                error={!!errors.quantity}\n                helperText={errors.quantity?.message}")

with open('src/components/CreateTransactionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed CreateTransactionModal.tsx")
