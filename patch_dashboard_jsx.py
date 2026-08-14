import re

with open("src/pages/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace KPI 2
old_kpi2 = """        {/* KPI 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>مجموع الأرصدة المتوفرة</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#007ab7', mt: 1 }}>
                  {totalCurrentStock}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', color: '#007ab7', borderRadius: '12px' }}>
                <InventoryIcon />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#007ab7', display: 'block', mt: 1.5, fontWeight: 'bold' }}>
              إجمالي وحدات الكميات الحالية
            </Typography>
          </Paper>
        </Grid>"""

new_kpi2 = """        {/* KPI 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>أكثر المواد استهلاكاً (الشهر)</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007ab7', mt: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={mostConsumedItem.name}>
                  {mostConsumedItem.name}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', color: '#007ab7', borderRadius: '12px' }}>
                <InventoryIcon />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#007ab7', display: 'block', mt: 1.5, fontWeight: 'bold' }}>
              بحجم استهلاك: {mostConsumedItem.qty} وحدة
            </Typography>
          </Paper>
        </Grid>"""

content = content.replace(old_kpi2, new_kpi2)

# Replace KPI 4
old_kpi4 = """        {/* KPI 4 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>حركات التوريد والصرف (الشهر)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7c3aed', mt: 1 }}>{monthlyTxCount}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#faf5ff', color: '#7c3aed', borderRadius: '12px' }}>
                <ReceiptLongIcon />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#7c3aed', display: 'block', mt: 1.5, fontWeight: 'bold' }}>
              مقارنة بـ {dailyTxCount} حركة لهذا اليوم
            </Typography>
          </Paper>
        </Grid>"""

new_kpi4 = """        {/* KPI 4 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>عدد الحركات (اليوم / الشهر)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7c3aed', mt: 1 }}>{dailyTxCount} / {monthlyTxCount}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: '#faf5ff', color: '#7c3aed', borderRadius: '12px' }}>
                <ReceiptLongIcon />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#7c3aed', display: 'block', mt: 1.5, fontWeight: 'bold' }}>
              نشاط التوريد والصرف
            </Typography>
          </Paper>
        </Grid>"""
content = content.replace(old_kpi4, new_kpi4)

# Replace BarChart 2 (Items per Warehouse) with (Additions vs Withdrawals)
old_chart2 = """            {/* Chart 2: Items per Warehouse */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #f1f5f9', height: '100%', minHeight: 320 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                  التوزيع اللوجستي للأصناف النشطة بالمستودعات
                </Typography>
                {warehouseDistributionData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={warehouseDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <ChartTooltip formatter={(value) => `${value} صنف`} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {warehouseDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', height: 220, justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>لا توجد بيانات لوجستية للعرض</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>"""

new_chart2 = """            {/* Chart 2: Rates of Withdrawals and Additions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #f1f5f9', height: '100%', minHeight: 320 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 3 }}>
                  معدلات السحب والإضافة للمستودعات
                </Typography>
                {warehouseInOutData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={warehouseInOutData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <ChartTooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="وارد" fill="#10b981" radius={[4, 4, 0, 0]} name="إضافة (وارد)" />
                        <Bar dataKey="صادر" fill="#ef4444" radius={[4, 4, 0, 0]} name="سحب (صادر)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', height: 220, justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>لا توجد بيانات للحركات لعرضها</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>"""

content = content.replace(old_chart2, new_chart2)

with open("src/pages/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

