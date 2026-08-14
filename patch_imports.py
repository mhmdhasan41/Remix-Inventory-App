import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_line = "import { Box, Typography, Paper, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';"
new_import_line = "import { Box, Typography, Paper, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';"

content = content.replace(import_line, new_import_line)

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)
