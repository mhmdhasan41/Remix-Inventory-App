import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I replaced the imports but the previous string I replaced didn't contain all of them because it was wrapped across multiple lines!
# I will just find the whole import block for @mui/material and replace it with everything needed.

# Let's get the original list from my first grep if possible, or just add all missing imports.
# The missing ones are:
# ListItem, List, Grid (Wait, Grid is in @mui/system or @mui/material/Grid2?), IconButton, ListItemText, Card, CardContent, Avatar, Chip, Checkbox, DialogContentText.
# Let's import everything standard from @mui/material:
new_import = "import { Box, Typography, Paper, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton, Card, CardContent, Avatar, Chip, Checkbox, DialogContentText } from '@mui/material';\\nimport Grid from '@mui/material/Grid2';"

content = re.sub(r"import\s*\{\s*Box.*?'@mui/material';", new_import, content, flags=re.DOTALL)

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)
