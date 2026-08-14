import re

with open('src/pages/Materials.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<Grid size=\{\{\s*xs:\s*12,\s*md:\s*2\s*\}\}\s*sx=\{\{\s*display:\s*\'flex\',\s*justifyContent:\s*\'flex-end\',\s*alignItems:\s*\'center\',\s*gap:\s*1\s*\}\}>\s*<Tooltip title="مسح الفلاتر">\s*<IconButton\s*onClick=\{handleClearFilters\}\s*size="small"\s*disabled=\{!searchQuery && categoryFilter === \'all\' && stockStatusFilter === \'all\'\}\s*sx=\{\{\s*border:\s*\'1px solid #e2e8f0\',\s*borderRadius:\s*\'8px\',\s*bgcolor:\s*\'#f8fafc\'\s*\}\}\s*>\s*<FilterAltOffIcon fontSize="small" sx=\{\{\s*color:\s*\'#64748b\'\s*\}\}\s*/>\s*</IconButton>\s*</Tooltip>\s*<Typography variant="body2" sx=\{\{\s*fontWeight:\s*\'bold\',\s*color:\s*\'#64748b\',\s*fontFamily:\s*\'"Cairo", sans-serif\'\s*\}\}>\s*الأصناف المطابقة:\s*\{filteredMaterials.filter\(m => !m.isSubRow\).length\}\s*</Typography>\s*</Grid>'

new_block = """          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1.5, alignSelf: 'center', justifyContent: 'flex-end' }}>
            <Tooltip title="تفريغ كافة فلاتر البحث وإعادتها للافتراضي">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                disabled={!searchQuery && categoryFilter === 'all' && stockStatusFilter === 'all'}
                startIcon={<FilterAltOffIcon sx={{ ml: 1, mr: -0.5 }} />}
                sx={{ borderRadius: '10px', px: 2, fontFamily: '"Cairo", sans-serif', width: '100%' }}
              >
                مسح الفلاتر
              </Button>
            </Tooltip>
          </Grid>
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b', fontFamily: '"Cairo", sans-serif', textAlign: 'left', mt: 1 }}>
              الأصناف المطابقة: {filteredMaterials.filter(m => !m.isSubRow).length}
            </Typography>
          </Grid>"""

content = re.sub(pattern, new_block, content, flags=re.MULTILINE)

with open('src/pages/Materials.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
