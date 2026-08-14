import re

with open('src/theme/theme.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export const getDesignTokens = (mode: PaletteMode) => ({", "export const getDesignTokens = (mode: PaletteMode) => ({\n  direction: 'rtl' as const,")

with open('src/theme/theme.ts', 'w', encoding='utf-8') as f:
    f.write(content)
