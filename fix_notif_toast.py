import re

with open('src/components/NotificationToast.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Original in NotificationToast:
#           '& .MuiAlert-icon': {
#             fontSize: '1.5rem',
#             marginRight: '0',
#             marginLeft: '12px'
#           },
#           ...
#           '& .MuiAlert-action': {
#             paddingLeft: '0',
#             marginRight: 'auto',
#             paddingRight: '16px'
#           }

content = content.replace(
    "marginRight: '0',\n            marginLeft: '12px'",
    "marginLeft: '0',\n            marginRight: '12px'"
)

content = content.replace(
    "paddingLeft: '0',\n            marginRight: 'auto',\n            paddingRight: '16px'",
    "paddingRight: '0',\n            marginLeft: 'auto',\n            paddingLeft: '16px'"
)

with open('src/components/NotificationToast.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
