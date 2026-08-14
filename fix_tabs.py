import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace Tabs
new_tabs = """      <Tabs 
        value={activeTab} 
        onChange={(e, val) => setActiveTab(val)} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          mb: 4, 
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTabs-indicator': { bgcolor: '#007ab7' },
          '& .MuiTab-root': { fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' },
          '& .Mui-selected': { color: '#007ab7 !important' }
        }}
      >
        <Tab icon={<BusinessIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الهوية المؤسسية والتوقيعات" />
        <Tab icon={<LayersIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="خيارات تهيئة المستودعات والأصناف" />
        <Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الجهات والموردين" />
        <Tab icon={<SecurityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الحسابات والصلاحيات" />
        <Tab icon={<BackupIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="النسخ الاحتياطي والاستعادة" />
      </Tabs>"""

content = re.sub(r"<Tabs.*?</Tabs>", new_tabs, content, flags=re.DOTALL)

# 2. Extract sections
# To do this safely, we will split by the known '{activeTab === X && (' strings.
# But we need to find the ending ')}' for each.

import ast

def extract_jsx_block(text, start_str):
    start_idx = text.find(start_str)
    if start_idx == -1: return None, -1, -1
    
    # We need to find the matching closing bracket for the opening one.
    # The start_str ends with '{activeTab === X && ('.
    idx = start_idx + len(start_str)
    brace_count = 1
    in_string = False
    string_char = ''
    while idx < len(text) and brace_count > 0:
        c = text[idx]
        if in_string:
            if c == string_char and text[idx-1] != '\\':
                in_string = False
        else:
            if c in ["'", '"', '`']:
                in_string = True
                string_char = c
            elif c == '(':
                brace_count += 1
            elif c == ')':
                brace_count -= 1
        idx += 1
    
    # Actually it's '{activeTab === X && (<Grid ...> ... </Grid>)}'
    # Wait, the closing is `)}`
    # Let's find `)}` that matches the open parenthesis of `&& (`
    return text[start_idx:idx+1], start_idx, idx+1

old_tab0, s0, e0 = extract_jsx_block(content, "{activeTab === 0 && (")
old_tab1, s1, e1 = extract_jsx_block(content, "{activeTab === 1 && (")
old_tab2, s2, e2 = extract_jsx_block(content, "{activeTab === 2 && (")
old_tab3, s3, e3 = extract_jsx_block(content, "{activeTab === 3 && (")

# Let's verify lengths
print(f"Tab 0 length: {len(old_tab0) if old_tab0 else 0}")
print(f"Tab 1 length: {len(old_tab1) if old_tab1 else 0}")
print(f"Tab 2 length: {len(old_tab2) if old_tab2 else 0}")
print(f"Tab 3 length: {len(old_tab3) if old_tab3 else 0}")

