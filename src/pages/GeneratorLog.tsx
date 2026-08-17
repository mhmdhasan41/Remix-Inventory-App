import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Container, Grid, Paper, Box, Button, Table, TableBody, TableCell, TableRow, TableHead,
  TableContainer, Chip, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from '@mui/material';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as ChartTooltip, Legend 
} from 'recharts';

import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FunctionsIcon from '@mui/icons-material/Functions';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';

import { dataService } from '../services/dataService';
import { GeneratorLogEntry } from '../types';
import { exportToExcel } from '../utils/exportExcel';
import { printHtml } from '../utils/printHtml';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function getArabicDayName(dateStr: string): string {
  if (!dateStr) return '';
  const dt = new Date(dateStr + 'T00:00:00');
  return ARABIC_DAYS[dt.getDay()] || '';
}

export default function GeneratorLog() {
  const [logs, setLogs] = useState<GeneratorLogEntry[]>([]);
  const [settings, setSettings] = useState(dataService.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState('');
  const [formCurrentReading, setFormCurrentReading] = useState<string>('');
  const [formPreviousReading, setFormPreviousReading] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = () => {
    setLogs(dataService.getGeneratorLogs());
    setSettings(dataService.getSettings());
  };

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  // Compute stats across all logs
  const stats = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const count = sortedLogs.length;

    const totalHours = sortedLogs.reduce((sum, item) => sum + item.operatingHours, 0);

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearStr = `${now.getFullYear()}`;

    const monthHours = sortedLogs
      .filter((item) => item.date.startsWith(currentMonthStr))
      .reduce((sum, item) => sum + item.operatingHours, 0);

    const yearHours = sortedLogs
      .filter((item) => item.date.startsWith(currentYearStr))
      .reduce((sum, item) => sum + item.operatingHours, 0);

    const lastLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
    const lastRunHours = lastLog ? lastLog.operatingHours : 0;
    const lastRecordedReading = lastLog ? lastLog.currentReading : 0;

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const logsLast30Days = sortedLogs.filter((item) => item.date >= thirtyDaysAgoStr);
    const maxHoursLast30Days = logsLast30Days.reduce((max, item) => Math.max(max, item.operatingHours), 0);
    const maxHoursAllTime = sortedLogs.reduce((max, item) => Math.max(max, item.operatingHours), 0);
    const avgHours = count > 0 ? Number((totalHours / count).toFixed(2)) : 0;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      monthHours: Number(monthHours.toFixed(2)),
      yearHours: Number(yearHours.toFixed(2)),
      lastRunHours,
      maxHoursLast30Days,
      maxHoursAllTime,
      avgHours,
      count,
      lastRecordedReading,
    };
  }, [logs]);

  // Daily Operating Hours Chart Data (Last 30 Days)
  const lineChartData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    return logs
      .filter((item) => item.date >= thirtyDaysAgoStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: item.date,
        day: item.dayName,
        label: `${item.date} (${item.dayName})`,
        hours: item.operatingHours,
      }));
  }, [logs]);

  // Monthly Operating Hours Chart Data (Bar Chart)
  const barChartData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};
    logs.forEach((item) => {
      const monthKey = item.date.substring(0, 7); // YYYY-MM
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + item.operatingHours;
    });

    return Object.keys(monthlyMap)
      .sort()
      .map((monthKey) => ({
        month: monthKey,
        hours: Number(monthlyMap[monthKey].toFixed(2)),
      }));
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((item) => {
        if (fromDate && item.date < fromDate) return false;
        if (toDate && item.date > toDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNotes = item.notes?.toLowerCase().includes(q);
          const matchUser = item.createdBy.toLowerCase().includes(q);
          const matchDate = item.date.includes(q);
          const matchDay = item.dayName.includes(q);
          if (!matchNotes && !matchUser && !matchDate && !matchDay) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Table descending by date
  }, [logs, fromDate, toDate, searchQuery]);

  // Handle open add modal
  const handleOpenAdd = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const latest = dataService.getLatestGeneratorLog();
    const prevReading = latest ? latest.currentReading : 0;

    setFormDate(todayStr);
    setFormPreviousReading(prevReading);
    setFormCurrentReading('');
    setFormNotes('');
    setFormError(null);
    setEditingId(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (entry: GeneratorLogEntry) => {
    setFormDate(entry.date);
    setFormPreviousReading(entry.previousReading);
    setFormCurrentReading(String(entry.currentReading));
    setFormNotes(entry.notes || '');
    setFormError(null);
    setEditingId(entry.id);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // Handle open view modal
  const handleOpenView = (entry: GeneratorLogEntry) => {
    setFormDate(entry.date);
    setFormPreviousReading(entry.previousReading);
    setFormCurrentReading(String(entry.currentReading));
    setFormNotes(entry.notes || '');
    setFormError(null);
    setEditingId(entry.id);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // Calculate current operating hours in form
  const computedOperatingHours = useMemo(() => {
    const cur = parseFloat(formCurrentReading);
    if (isNaN(cur)) return 0;
    const diff = cur - formPreviousReading;
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  }, [formCurrentReading, formPreviousReading]);

  // Date change handler in form
  const handleDateChange = (newDate: string) => {
    setFormDate(newDate);
    setFormError(null);
    // Find the latest reading prior to or on this date if adding
    if (dialogMode === 'add') {
      const sortedBefore = logs
        .filter((l) => l.date < newDate)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (sortedBefore.length > 0) {
        setFormPreviousReading(sortedBefore[sortedBefore.length - 1].currentReading);
      } else {
        const latest = dataService.getLatestGeneratorLog();
        setFormPreviousReading(latest ? latest.currentReading : 0);
      }
    }
  };

  // Handle Save
  const handleSave = () => {
    setFormError(null);
    if (!formDate) {
      setFormError('يرجى اختيار التاريخ بشكل صحيح.');
      return;
    }

    const cur = parseFloat(formCurrentReading);
    if (isNaN(cur)) {
      setFormError('يرجى إدخال القراءة الحالية بشكل صحيح.');
      return;
    }

    if (cur < formPreviousReading) {
      setFormError(`القراءة الحالية (${cur}) أقل من القراءة السابقة (${formPreviousReading}). يمنع الحفظ في هذه الحالة.`);
      return;
    }

    try {
      dataService.saveGeneratorLog({
        id: editingId || undefined,
        date: formDate,
        dayName: getArabicDayName(formDate),
        previousReading: formPreviousReading,
        currentReading: cur,
        notes: formNotes.trim(),
      });
      setDialogOpen(false);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_DATE_EXISTS') {
        setFormError(`يوجد سجل آخر محفوظ مسبقاً بنفس هذا التاريخ (${formDate}). يُسمح بسجل واحد فقط لكل يوم.`);
      } else if (err.message === 'CURRENT_READING_LESS_THAN_PREVIOUS') {
        setFormError(`القراءة الحالية أقل من القراءة السابقة. لا يمكن إتمام الحفظ.`);
      } else {
        setFormError('حدث خطأ أثناء حفظ السجل: ' + err.message);
      }
    }
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (deletingId) {
      dataService.deleteGeneratorLog(deletingId);
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = () => {
    const headers = ['التاريخ', 'اليوم', 'القراءة السابقة', 'القراءة الحالية', 'ساعات التشغيل', 'الملاحظات', 'المُدخل'];
    const rows = filteredLogs.map((item) => [
      item.date,
      item.dayName,
      String(item.previousReading),
      String(item.currentReading),
      String(item.operatingHours),
      item.notes || '-',
      item.createdBy,
    ]);

    exportToExcel({
      title: 'سجل تشغيل ومتابعة عداد المولد',
      organizationName: settings.organizationName,
      departmentName: settings.departmentName,
      filename: `generator_log_${new Date().toISOString().split('T')[0]}.xlsx`,
      metaFields: [
        { label: 'عدد السجلات المشمولة:', value: `${filteredLogs.length} سجل` },
        { label: 'إجمالي ساعات التشغيل المعروضة:', value: `${filteredLogs.reduce((s, i) => s + i.operatingHours, 0).toFixed(2)} ساعة` },
      ],
      headers,
      rows,
    });
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    const headers = ['التاريخ', 'اليوم', 'القراءة السابقة', 'القراءة الحالية', 'ساعات التشغيل', 'الملاحظات', 'المُدخل'];
    const rows = filteredLogs.map((item) => [
      item.date,
      item.dayName,
      String(item.previousReading),
      String(item.currentReading),
      String(item.operatingHours),
      item.notes || '-',
      item.createdBy,
    ]);

    printHtml({
      title: 'سجل قراءات وساعات تشغيل المولد',
      organizationName: settings.organizationName,
      departmentName: settings.departmentName,
      metaFields: [
        { label: 'تاريخ التقرير:', value: new Date().toLocaleDateString('ar-EG') },
        { label: 'إجمالي ساعات التشغيل التراكمية:', value: `${stats.totalHours} ساعة` },
        { label: 'عدد السجلات المشمولة:', value: `${filteredLogs.length} سجل` },
        { label: 'آخر قراءة مسجلة:', value: `${stats.lastRecordedReading}` },
      ],
      tables: [
        {
          headers,
          rows,
          recordIds: filteredLogs.map((item) => item.id),
          columnAlignments: ['center', 'center', 'center', 'center', 'center', 'right', 'center'],
        },
      ],
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6, direction: 'rtl' }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
          color: 'white',
          boxShadow: '0 12px 24px -6px rgba(2, 132, 199, 0.35)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ElectricBoltIcon sx={{ fontSize: 32, color: '#fef08a' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Cairo, sans-serif', letterSpacing: '-0.02em' }}>
                سجل تشغيل المولد
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Cairo, sans-serif', mt: 0.5 }}>
                متابعة وتوثيق ساعات تشغيل المولد، العداد التراكمي، وتحليلات التشغيل اليومية والشهرية.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                bgcolor: '#facc15',
                color: '#0f172a',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: '#eab308' },
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              تسجيل قراءة جديدة
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                px: 2,
                borderRadius: 2,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              تصدير Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handleExportPDF}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                px: 2,
                borderRadius: 2,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              تصدير PDF
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Top Section: 9 Stats Cards */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Cairo, sans-serif', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
        <SpeedIcon color="primary" /> المؤشرات والإحصائيات التراكمية (9 مؤشرات)
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
        {/* Card 1: Total Operating Hours */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              إجمالي التشغيل (التراكمي)
            </Typography>
            <FunctionsIcon sx={{ color: '#0284c7' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284c7', fontFamily: 'Cairo, sans-serif' }}>
            {stats.totalHours} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 2: Current Month Hours */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              تشغيل الشهر الحالي
            </Typography>
            <CalendarMonthIcon sx={{ color: '#059669' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', fontFamily: 'Cairo, sans-serif' }}>
            {stats.monthHours} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 3: Current Year Hours */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              تشغيل السنة الحالية
            </Typography>
            <CalendarTodayIcon sx={{ color: '#7c3aed' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#7c3aed', fontFamily: 'Cairo, sans-serif' }}>
            {stats.yearHours} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 4: Hours of Last Run */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              ساعات آخر تشغيل
            </Typography>
            <HistoryToggleOffIcon sx={{ color: '#d97706' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#d97706', fontFamily: 'Cairo, sans-serif' }}>
            {stats.lastRunHours} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 5: Max Hours Last 30 Days */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              أعلى تشغيل (آخر 30 يوماً)
            </Typography>
            <ShowChartIcon sx={{ color: '#ea580c' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ea580c', fontFamily: 'Cairo, sans-serif' }}>
            {stats.maxHoursLast30Days} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 6: Max Hours All-Time */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              أعلى تشغيل (التراكمي)
            </Typography>
            <BarChartIcon sx={{ color: '#dc2626' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#dc2626', fontFamily: 'Cairo, sans-serif' }}>
            {stats.maxHoursAllTime} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة</Typography>
          </Typography>
        </Paper>

        {/* Card 7: Average Hours */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              متوسط ساعات التشغيل
            </Typography>
            <AccessTimeIcon sx={{ color: '#2563eb' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb', fontFamily: 'Cairo, sans-serif' }}>
            {stats.avgHours} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>ساعة/سجل</Typography>
          </Typography>
        </Paper>

        {/* Card 8: Total Records Count */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              عدد السجلات المسجلة
            </Typography>
            <FormatListNumberedIcon sx={{ color: '#0891b2' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0891b2', fontFamily: 'Cairo, sans-serif' }}>
            {stats.count} <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>سجل</Typography>
          </Typography>
        </Paper>

        {/* Card 9: Last Recorded Reading */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
              آخر قراءة مسجلة للعداد
            </Typography>
            <SpeedIcon sx={{ color: '#16a34a' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', fontFamily: 'Cairo, sans-serif' }}>
            {stats.lastRecordedReading}
          </Typography>
        </Paper>
      </Box>

      {/* Middle Section: 2 Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {/* Chart 1: Line Chart (Daily Hours Last 30 Days) */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon color="primary" /> ساعات التشغيل اليومية خلال آخر 30 يوماً (Line Chart)
          </Typography>
          <Box sx={{ width: '100%', height: 300, dir: 'ltr' }}>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip formatter={(val: any) => [`${val} ساعة`, 'ساعات التشغيل']} labelFormatter={(lbl: any) => `التاريخ: ${lbl}`} />
                  <Legend formatter={() => 'ساعات التشغيل'} />
                  <Line type="monotone" dataKey="hours" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif' }}>لا توجد سجلات تشغيل خلال آخر 30 يوماً</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chart 2: Bar Chart (Monthly Hours) */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon color="secondary" /> إجمالي ساعات التشغيل لكل شهر (Bar Chart)
          </Typography>
          <Box sx={{ width: '100%', height: 300, dir: 'ltr' }}>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip formatter={(val: any) => [`${val} ساعة`, 'إجمالي الشهر']} labelFormatter={(lbl: any) => `الشهر: ${lbl}`} />
                  <Legend formatter={() => 'إجمالي ساعات الشهر'} />
                  <Bar dataKey="hours" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo, sans-serif' }}>لا توجد بيانات سجلات مجمعة حسب الأشهر</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Bottom Section: Data Table & Filters */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" /> جدول سجلات تشغيل المولد
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              type="date"
              label="من تاريخ"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{ width: 160 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="إلى تاريخ"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{ width: 160 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              placeholder="بحث بالملاحظات أو المُدخل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 220 }}
            />
            {(fromDate || toDate || searchQuery) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RotateLeftIcon />}
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setSearchQuery('');
                }}
                sx={{ fontFamily: 'Cairo, sans-serif' }}
              >
                إعادة ضبط
              </Button>
            )}
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>التاريخ</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>اليوم</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>القراءة السابقة</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>القراءة الحالية</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>ساعات التشغيل</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>الملاحظات</TableCell>
                <TableCell sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>المُدخل</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{item.date}</TableCell>
                    <TableCell>
                      <Chip label={item.dayName} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">{item.previousReading}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {item.currentReading}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${item.operatingHours} ساعة`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.notes || '-'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                      {item.createdBy}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton size="small" color="info" onClick={() => handleOpenView(item)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Cairo, sans-serif' }}>
                      لا توجد سجلات تشغيل مضافة تتطابق مع شروط البحث والفلترة.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit / View Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, bgcolor: 'primary.main', color: 'white' }}>
          {dialogMode === 'add' && 'تسجيل قراءة مولد جديدة'}
          {dialogMode === 'edit' && 'تعديل سجل تشغيل المولد'}
          {dialogMode === 'view' && 'عرض تفاصيل سجل تشغيل المولد'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, fontFamily: 'Cairo, sans-serif' }}>
              {formError}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2.5, mt: 1 }}>
            <TextField
              fullWidth
              type="date"
              label="تاريخ التشغيل"
              value={formDate}
              disabled={dialogMode === 'view'}
              onChange={(e) => handleDateChange(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              fullWidth
              label="اليوم (محسوب تلقائياً)"
              value={getArabicDayName(formDate)}
              slotProps={{ input: { readOnly: true } }}
            />

            <TextField
              fullWidth
              type="number"
              label="القراءة السابقة للعداد"
              value={formPreviousReading}
              helperText="تؤخذ تلقائياً من آخر سجل محفوظ"
              slotProps={{ input: { readOnly: true } }}
            />

            <TextField
              fullWidth
              type="number"
              label="القراءة الحالية للعداد *"
              value={formCurrentReading}
              disabled={dialogMode === 'view'}
              onChange={(e) => {
                setFormCurrentReading(e.target.value);
                setFormError(null);
              }}
              autoFocus={dialogMode !== 'view'}
            />

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
                    عدد ساعات التشغيل المحسوبة تلقائياً:
                  </Typography>
                  <Chip
                    label={`${computedOperatingHours} ساعة`}
                    color={computedOperatingHours > 0 ? 'success' : 'default'}
                    sx={{ fontWeight: 800, fontSize: '1rem', px: 1 }}
                  />
                </Box>
              </Paper>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="الملاحظات والتفاصيل التشغيلية"
                value={formNotes}
                disabled={dialogMode === 'view'}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات فنية أو ظروف تشغيل خاصة..."
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: 'Cairo, sans-serif' }}>
            {dialogMode === 'view' ? 'إغلاق' : 'إلغاء'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, px: 3 }}
            >
              حفظ السجل
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} dir="rtl">
        <DialogTitle sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800 }}>
          تأكيد حذف سجل تشغيل المولد
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ fontFamily: 'Cairo, sans-serif' }}>
            هل أنت تأكد من رغبتك في حذف هذا السجل نهائياً من النظام؟ لا يمكن التراجع عن هذه العملية بعد التأكيد.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontFamily: 'Cairo, sans-serif' }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}
          >
            حذف السجل
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
