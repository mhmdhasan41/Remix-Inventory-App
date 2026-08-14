import re

with open('src/pages/Settings.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { notificationService } from '../services/notificationService';\n"
content = content.replace("import { dataService } from '../services/dataService';", 
                          "import { dataService } from '../services/dataService';\n" + import_stmt)

# Remove state
content = re.sub(r'const \[successMsg, setSuccessMsg\] = useState<string \| null>\(null\);\s*', '', content)
content = re.sub(r'const \[errorMsg, setErrorMsg\] = useState<string \| null>\(null\);\s*', '', content)

# Remove inline alerts
alert_pattern = r'\{\s*successMsg\s*&&\s*\(\s*<Alert\s+severity="success"[^>]*>[\s\S]*?<\/Alert>\s*\)\s*\}\s*\{\s*errorMsg\s*&&\s*\(\s*<Alert\s+severity="error"[^>]*>[\s\S]*?<\/Alert>\s*\)\s*\}'
content = re.sub(alert_pattern, '', content)
# Also try independent alerts if they are separated
content = re.sub(r'\{\s*successMsg\s*&&\s*\(\s*<Alert\s+severity="success"[^>]*>[\s\S]*?<\/Alert>\s*\)\s*\}', '', content)
content = re.sub(r'\{\s*errorMsg\s*&&\s*\(\s*<Alert\s+severity="error"[^>]*>[\s\S]*?<\/Alert>\s*\)\s*\}', '', content)

# Fix conditional setErrorMsg
content = content.replace("setErrorMsg(errorLines.length > 0 ? 'تم تخطي بعض الأسطر لعدم استيفاء البيانات، يرجى مراجعتها.' : null);",
                          "if (errorLines.length > 0) notificationService.showError('تم تخطي بعض الأسطر لعدم استيفاء البيانات، يرجى مراجعتها.');")

# Remove clear messages
content = re.sub(r'setTimeout\(\(\)\s*=>\s*setSuccessMsg\(null\),\s*\d+\);?', '', content)
content = re.sub(r'setSuccessMsg\(null\);?', '', content)
content = re.sub(r'setErrorMsg\(null\);?', '', content)

# Replace remaining
content = re.sub(r'setSuccessMsg\(([^)]+)\)', r'notificationService.showSuccess(\1)', content)
content = re.sub(r'setErrorMsg\(([^)]+)\)', r'notificationService.showError(\1)', content)

with open('src/pages/Settings.tsx', 'w') as f:
    f.write(content)
print("Settings.tsx refactored.")
