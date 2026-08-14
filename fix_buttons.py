import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ textAlign: 'start' }}>"""

replacement = """        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 2.5, gap: 1.5 }}>
          <Box sx={{ textAlign: 'start' }}>"""

content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

