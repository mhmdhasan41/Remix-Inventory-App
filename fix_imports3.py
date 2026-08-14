import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_import = "import { Box, Typography, Paper, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton, Card, CardContent, Avatar, Chip, Checkbox, DialogContentText, Tabs, Tab, FormControlLabel } from '@mui/material';\\nimport Grid from '@mui/system/Grid';"

content = re.sub(r"import\s*\{\s*Box.*?'@mui/system/Grid';", new_import, content, flags=re.DOTALL)
content = re.sub(r"import\s*\{\s*Box.*?'@mui/material/Grid2';", new_import, content, flags=re.DOTALL)


with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)
