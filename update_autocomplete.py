with open('src/components/CreateTransactionModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={option.code} size="small" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} />
                          <Typography>{option.name}</Typography>
                        </Box>
                      </li>
                    )}"""

replacement = """                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
                          <Chip label={option.code} size="small" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} />
                          {renderOption(option.name, 'item')}
                        </Box>
                      </li>
                    )}"""

content = content.replace(target, replacement)

with open('src/components/CreateTransactionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
