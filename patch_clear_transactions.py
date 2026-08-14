import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            <Button
              size="small"
              variant="text"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setItemTypeFilter('all');
                handleSmartDateChange('all');
                setAttachmentFilter('all');
                setEmployeeFilter('all');
              }}
              sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#007ab7' }}
            >
              مسح الفلاتر 🔄
            </Button>"""

new_block = """            <Tooltip title="تفريغ كافة فلاتر البحث وإعادتها للافتراضي">
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

content = content.replace(old_block, new_block)

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
