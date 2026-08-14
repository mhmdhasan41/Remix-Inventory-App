const fs = require('fs');

let content = fs.readFileSync('src/pages/Transactions.tsx', 'utf-8');

content = content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import { useState, useEffect, useMemo } from 'react';");
content = content.replace("import { Card, CardContent, Typography, Box, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';", "import { Typography, Box, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';");
content = content.replace("import InfoIcon from '@mui/icons-material/Info';\n", "");
content = content.replace("import jsPDF from 'jspdf';\n", "");
content = content.replace("import 'jspdf-autotable';\n", "");
content = content.replace("import { printHtml } from '../utils/printHelper';\n", "");
content = content.replace("import { compressImage } from '../utils/imageUtils';\n", "");
content = content.replace(/function compressImage\(.*?\};?\s*\}/s, ""); // this might have been what compressImage was... Wait, compressImage was a function inside? No, let's just replace if it's there.

fs.writeFileSync('src/pages/Transactions.tsx', content);

