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

def extract_jsx_block(text, start_str):
    start_idx = text.find(start_str)
    if start_idx == -1: return None, -1, -1
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
    if idx < len(text) and text[idx] == '}':
        idx += 1
    return text[start_idx:idx], start_idx, idx

old_tab0, s0, e0 = extract_jsx_block(content, "{activeTab === 0 && (")
old_tab1, s1, e1 = extract_jsx_block(content, "{activeTab === 1 && (")
old_tab2, s2, e2 = extract_jsx_block(content, "{activeTab === 2 && (")
old_tab3, s3, e3 = extract_jsx_block(content, "{activeTab === 3 && (")

cat_idx = old_tab0.find("{/* Categories management Card */}")
identity_part = old_tab0[:cat_idx]

# Change Identity Card to take full width
identity_part = identity_part.replace("<Grid size={{ xs: 12, md: 6 }}>", "<Grid size={{ xs: 12, md: 10, lg: 8 }} sx={{ mx: 'auto' }}>", 1)

new_tab0 = identity_part + "        </Grid>\n      )}"
new_tab1_content = old_tab0[cat_idx:]
new_tab1 = "{activeTab === 1 && (\n        <Grid container spacing={3} sx={{ pt: 1 }}>\n          " + new_tab1_content

new_tab2 = old_tab3.replace("{activeTab === 3 && (", "{activeTab === 2 && (", 1)
new_tab3 = old_tab1.replace("{activeTab === 1 && (", "{activeTab === 3 && (", 1)
new_tab4 = old_tab2.replace("{activeTab === 2 && (", "{activeTab === 4 && (", 1)

# Now we replace the whole block of tabs content.
# The tabs content starts at s0 and ends at e3.
# Wait, s0 to e3 might contain some spaces or other things between them.
# Let's just reconstruct the whole string.

new_all_tabs = new_tab0 + "\n\n      " + new_tab1 + "\n\n      " + new_tab2 + "\n\n      " + new_tab3 + "\n\n      " + new_tab4

content = content[:s0] + new_all_tabs + content[e3:]

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)

