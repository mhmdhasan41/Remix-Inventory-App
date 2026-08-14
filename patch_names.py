import re

files = ['src/pages/Reports.tsx', 'src/pages/Materials.tsx', 'src/pages/Transactions.tsx']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
        
    content = content.replace("'م. أحمد خالد'", "''")
    content = content.replace("'م. محمود علي'", "''")
    content = content.replace("'د. سامي حسن'", "''")
    
    with open(file, 'w') as f:
        f.write(content)

print("done")
