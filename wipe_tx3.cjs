const fs = require('fs');
let content = fs.readFileSync('src/pages/Transactions.tsx.bak', 'utf-8');

// Imports
content = content.replace("import { useForm, Controller } from 'react-hook-form';", "import CreateTransactionModal from '../components/CreateTransactionModal';");
content = content.replace("import { zodResolver } from '@hookform/resolvers/zod';\n", "");
content = content.replace("import * as zod from 'zod';\n", "");
content = content.replace("import Autocomplete from '@mui/material/Autocomplete';\n", "");
content = content.replace("import AddCircleIcon from '@mui/icons-material/AddCircle';\n", "");
content = content.replace("import MaterialFormDialog from '../components/MaterialFormDialog';\n", "");
content = content.replace("import { Tooltip, IconButton } from '@mui/material';\n", "");
content = content.replace("import { InventoryTransaction, Material, AppSettings, Storehouse, TransactionViewRow } from '../types';", "import { InventoryTransaction, Material, AppSettings, TransactionViewRow } from '../types';");


// Schema
const schemaStart = "const transactionSchema = zod.object({";
const schemaEnd = "type TransactionFormValues = zod.infer<typeof transactionSchema>;\n";
const i1 = content.indexOf(schemaStart);
if (i1 !== -1) {
  const i2 = content.indexOf(schemaEnd, i1) + schemaEnd.length;
  content = content.substring(0, i1) + content.substring(i2);
}

// Unused hooks and states 
content = content.replace("  const [openItemModal, setOpenItemModal] = useState(false);\n", "");
content = content.replace("  const [openCropDialog, setOpenCropDialog] = useState(false);\n", "");
content = content.replace("  const [imageToCrop, setImageToCrop] = useState<string | null>(null);\n", "");
content = content.replace("  const [cropZoom, setCropZoom] = useState(1);\n", "");
content = content.replace("  const [cropRotation, setCropRotation] = useState(0);\n", "");
content = content.replace("  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });\n", "");
content = content.replace("  const [cropAspectRatio, setCropAspectRatio] = useState<'1:1' | '3:4' | '9:16'>('3:4');\n", "");
content = content.replace("  const [isCropDragging, setIsCropDragging] = useState(false);\n", "");
content = content.replace("  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });\n", "");
content = content.replace("  const [isSubmittingTx, setIsSubmittingTx] = useState(false);\n", "");
content = content.replace("  const [selectedImage, setSelectedImage] = useState<string | null>(null);\n", "");
content = content.replace("const { selectedStorehouse, setSelectedStorehouse } = useStorehouse();", "const { selectedStorehouse } = useStorehouse();");
content = content.replace("const cropImgRef = React.useRef<HTMLImageElement | null>(null);\n", "");


// Crop functions
const cropFnStart = "  const handleCropStart = (clientX: number, clientY: number) => {";
const cropFnEnd = "  const [successMessage, _setSuccessMessage] = useState<string | null>(null);";
const i3 = content.indexOf(cropFnStart);
const i4 = content.indexOf(cropFnEnd);
if (i3 !== -1 && i4 !== -1 && i3 < i4) {
  content = content.substring(0, i3) + content.substring(i4);
}

// useForm
const ufStart = "  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<TransactionFormValues>";
const nextFn = "  const handleOpenAddDialog = () => {";
const i5 = content.indexOf(ufStart);
const i6 = content.indexOf(nextFn, i5); // search AFTER i5
if (i5 !== -1 && i6 !== -1 && i5 < i6) {
  content = content.substring(0, i5) + content.substring(i6);
}

// getUnifiedItems
const guiStart = "  const getUnifiedItems = () => {";
const guiEnd = "  const handleItemModalSuccess = (msg: string) => {";
const i7 = content.indexOf(guiStart);
const i8 = content.indexOf(guiEnd, i7);
if (i7 !== -1 && i8 !== -1 && i7 < i8) {
  content = content.substring(0, i7) + content.substring(i8);
}

// handleItemModalSuccess
content = content.replace(/  const handleItemModalSuccess = \[\s\S\]*?  };\n/s, "");
const hIms = "  const handleItemModalSuccess = (msg: string) => {\n    setSuccessMessage(msg);\n    setOpenItemModal(false);\n    loadData();\n  };\n";
content = content.replace(hIms, "");


// handleOpenAddDialog replacement
const hrStart = content.indexOf("  const handleOpenAddDialog = () => {");
const hrEnd = content.indexOf("  const onSubmitForm = async", hrStart);
if (hrStart !== -1 && hrEnd !== -1 && hrStart < hrEnd) {
  content = content.substring(0, hrStart) + "  const handleOpenAddDialog = () => { setOpenAddDialog(true); };\n\n" + content.substring(hrEnd);
}

// onSubmitForm
const osStart = content.indexOf("  const onSubmitForm = async");
const delStart = content.indexOf("  const handleOpenDelete = (item: TransactionViewRow) => {", osStart);
if (osStart !== -1 && delStart !== -1 && osStart < delStart) {
  content = content.substring(0, osStart) + content.substring(delStart);
}

// getLiveStockStatus
const lssStart = content.indexOf("  const getLiveStockStatus = () => {");
const lssEndStr = "  const liveStockSim = getLiveStockStatus();\n";
const lssS = content.indexOf(lssStart);
if (lssStart !== -1) {
  const lssEnd = content.indexOf(lssEndStr, lssStart);
  if (lssEnd !== -1) {
      content = content.substring(0, lssStart) + content.substring(lssEnd + lssEndStr.length);
  }
}

// Dialog
const dStart = content.indexOf("{/* Record movement Dialg */}");
const dEndStr = "{/* Track movement rollback warning */}";
const dEnd = content.indexOf(dEndStr, dStart);
if (dStart !== -1 && dEnd !== -1 && dStart < dEnd) {
  content = content.substring(0, dStart) + `
      <CreateTransactionModal
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          loadData();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
        onError={(msg) => {
          setErrorMessage(msg);
          setTimeout(() => setErrorMessage(null), 6000);
        }}
        globalStorehouseScope={selectedStorehouse}
      />\n\n      ` + content.substring(dEnd);
}

// Crop JSX
const cjStart = content.indexOf("{/* Interactive Crop Dialog */}");
const cjEndStr = "    </Box>\n  );\n}";
const cjEnd = content.indexOf(cjEndStr, cjStart);
if (cjStart !== -1 && cjEnd !== -1 && cjStart < cjEnd) {
  content = content.substring(0, cjStart) + content.substring(cjEnd);
}

fs.writeFileSync('src/pages/Transactions.tsx', content);
console.log("Super clean done!");
