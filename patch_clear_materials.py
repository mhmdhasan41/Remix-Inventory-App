import re

with open('src/pages/Materials.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """          <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            <Tooltip title="مسح الفلاتر">
              <IconButton 
                onClick={handleClearFilters}
                size="small"
                disabled={!searchQuery && categoryFilter === 'all' && stockStatusFilter === 'all'}
                sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#f8fafc' }}
              >
                <FilterAltOffIcon fontSize="small" sx={{ color: '#64748b' }} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>
              إجمالي النتائج: {filteredMaterials.length}
            </Typography>
          </Grid>"""

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
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b', fontFamily: '"Cairo", sans-serif', textAlign: 'left' }}>
              إجمالي النتائج: {filteredMaterials.length}
            </Typography>
          </Grid>"""

content = content.replace(old_block, new_block)

with open('src/pages/Materials.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
