import re

with open('src/pages/Settings.tsx', 'r') as f:
    content = f.read()

# Add states back
state_defs = "  const [successMsg, setSuccessMsg] = useState<string | null>(null);\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);\n"
content = content.replace("  const [activeTab, setActiveTab] = useState(0);", state_defs + "  const [activeTab, setActiveTab] = useState(0);")

# Change notificationService.showSuccess back to setSuccessMsg
content = re.sub(r'notificationService\.showSuccess\(([^)]+)\)', r'setSuccessMsg(\1)', content)
content = re.sub(r'notificationService\.showError\(([^)]+)\)', r'setErrorMsg(\1)', content)

# Remove the import
content = content.replace("import { notificationService } from '../services/notificationService';\n", "")

# Add NotificationToast import
content = content.replace("import { dataService } from '../services/dataService';", 
                          "import { dataService } from '../services/dataService';\nimport NotificationToast from '../components/NotificationToast';")

# Add NotificationToast components at the end of the root Box
toast_components = """
      <NotificationToast open={!!successMsg} message={successMsg || ''} severity="success" onClose={() => setSuccessMsg(null)} />
      <NotificationToast open={!!errorMsg} message={errorMsg || ''} severity="error" onClose={() => setErrorMsg(null)} />
    </Box>
"""
content = content.replace("    </Box>\n  );\n}", toast_components + "  );\n}")

with open('src/pages/Settings.tsx', 'w') as f:
    f.write(content)
print("Settings.tsx fixed")
