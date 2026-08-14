import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<Button\s*size="small"\s*variant="text"\s*onClick=\{\(\) => \{\s*setSearchQuery\(\'\'\);\s*setTypeFilter\(\'all\'\);\s*setItemTypeFilter\(\'all\'\);\s*handleSmartDateChange\(\'all\'\);\s*setAttachmentFilter\(\'all\'\);\s*setEmployeeFilter\(\'all\'\);\s*\}\}\s*sx=\{\{ fontFamily: \'"Cairo", sans-serif\', fontWeight: \'bold\', color: \'#007ab7\' \}\}\s*>\s*مسح الفلاتر 🔄\s*</Button>'

new_block = """<Tooltip title="تفريغ كافة فلاتر البحث وإعادتها للافتراضي">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setItemTypeFilter('all');
                  handleSmartDateChange('all');
                  setAttachmentFilter('all');
                  setEmployeeFilter('all');
                }}
                startIcon={<FilterAltOffIcon sx={{ ml: 1, mr: -0.5 }} />}
                sx={{ borderRadius: '10px', px: 2, fontFamily: '"Cairo", sans-serif' }}
              >
                مسح الفلاتر
              </Button>
            </Tooltip>"""

content = re.sub(pattern, new_block, content, flags=re.MULTILINE)

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
