import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block 1
target1 = """              const openingAttachment = isOpeningStock && printCategory ? settings.openingStockAttachments?.[storehouse + '_' + printCategory] : undefined;
              const hasAttachment = transactionToPrint.attachment || openingAttachment;"""

replacement1 = """              const rawAttachment = transactionToPrint.attachment;
              let hasAttachment = rawAttachment;
              if (rawAttachment?.startsWith('opening_ref:')) {
                  const key = rawAttachment.replace('opening_ref:', '');
                  hasAttachment = settings.openingStockAttachments?.[key];
              }"""

content = content.replace(target1, replacement1)
content = content.replace("src={transactionToPrint.attachment || openingAttachment}", "src={hasAttachment}")

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
