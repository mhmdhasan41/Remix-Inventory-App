import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For Recharts in RTL, we must wrap the ResponsiveContainer in a div with dir="ltr"
# so the SVG coordinate system doesn't break, while keeping orientation="right" for YAxis.

# PieChart
content = content.replace(
    '''<ResponsiveContainer width="100%" height={220}>
                      <PieChart>''',
    '''<div dir="ltr" style={{ width: '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>'''
)
content = content.replace(
    '''</PieChart>
                    </ResponsiveContainer>''',
    '''</PieChart>
                    </ResponsiveContainer>
                    </div>'''
)

# BarChart
content = content.replace(
    '''<ResponsiveContainer width="100%" height={220}>
                      <BarChart data={warehouseDistributionData}>''',
    '''<div dir="ltr" style={{ width: '100%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={warehouseDistributionData}>'''
)
content = content.replace(
    '''</BarChart>
                    </ResponsiveContainer>''',
    '''</BarChart>
                    </ResponsiveContainer>
                    </div>'''
)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
