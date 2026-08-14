import re

with open('src/pages/Materials.tsx', 'r') as f:
    content = f.read()

old_button = """            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#007ab7', px: 4, py: 1.1, fontWeight: 'bold', borderRadius: '10px', '&:hover': { bgcolor: '#006293' } }}
            >
              {selectedMaterial ? 'تحديث' : 'إضافة'}
            </Button>"""

new_button = """            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: '#007ab7', px: 4, py: 1.1, fontWeight: 'bold', borderRadius: '10px', '&:hover': { bgcolor: '#006293' } }}
            >
              {isSubmitting ? 'جاري الحفظ...' : (selectedMaterial ? 'تحديث' : 'إضافة')}
            </Button>"""

if old_button in content:
    content = content.replace(old_button, new_button)
    with open('src/pages/Materials.tsx', 'w') as f:
        f.write(content)
    print("Materials.tsx button fixed")
else:
    print("Could not find button.")
