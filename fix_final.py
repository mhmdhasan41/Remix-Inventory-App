with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("          </TableContainer>\n          </Box>\n        </Paper>\n      )}", "          </TableContainer>\n        </Paper>\n      )}")

with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
