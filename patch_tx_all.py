import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix line 1307
target2 = """              const openingAttachment = isOpeningStock && printCategory ? settings.openingStockAttachments?.[storehouse + '_' + printCategory] : undefined;
                const hasAttachment = transactionToPrint.attachment || openingAttachment;"""
replacement2 = """              const rawAttachment = transactionToPrint.attachment;
              let hasAttachment = rawAttachment;
              if (rawAttachment?.startsWith('opening_ref:')) {
                  const key = rawAttachment.replace('opening_ref:', '');
                  hasAttachment = settings.openingStockAttachments?.[key];
              }"""
content = content.replace(target2, replacement2)

# Fix line 964 list view
target3 = """                            const openingAttachment = isOpeningStock && txCategory ? settings.openingStockAttachments?.[storehouse + '_' + txCategory] : undefined;
                            if (openingAttachment) {
                              return (
                                <Tooltip title={`عرض سند توثيق الرصيد الافتتاحي المعتمد لتصنيف: ${txCategory}`}>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#0284c7' }} 
                                    onClick={() => {
                                      setViewingAttachment(openingAttachment || null);
                                      setOpenAttachmentDialog(true);
                                    }}
                                  >
                                    <AttachFileIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              );
                            }"""

replacement3 = """                            // opening_ref logic handled below, but if tx.attachment has opening_ref: we show it
                            """

content = content.replace(target3, replacement3)

# And below that, there's the standard attachment check in list view:
target4 = """                            if (tx.attachment) {
                              return (
                                <Tooltip title="عرض المرفق">
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#0284c7' }} 
                                    onClick={() => {
                                      setViewingAttachment(tx.attachment || null);
                                      setOpenAttachmentDialog(true);
                                    }}
                                  >
                                    <AttachFileIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              );
                            }"""

replacement4 = """                            if (tx.attachment) {
                              let attToView = tx.attachment;
                              let tooltipText = "عرض المرفق";
                              if (attToView.startsWith('opening_ref:')) {
                                  const key = attToView.replace('opening_ref:', '');
                                  attToView = settings.openingStockAttachments?.[key] || '';
                                  tooltipText = "عرض سند توثيق الرصيد الافتتاحي";
                              }
                              if (attToView) {
                                  return (
                                    <Tooltip title={tooltipText}>
                                      <IconButton 
                                        size="small" 
                                        sx={{ color: '#0284c7' }} 
                                        onClick={() => {
                                          setViewingAttachment(attToView);
                                          setOpenAttachmentDialog(true);
                                        }}
                                      >
                                        <AttachFileIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  );
                              }
                            }"""

content = content.replace(target4, replacement4)


with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
