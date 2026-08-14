const fs = require('fs');

let content = fs.readFileSync('src/pages/Transactions.tsx', 'utf-8');

const insertionPoint = "  const [employeeFilter, setEmployeeFilter] = useState('all');";
const hookToAdd = `  const [employeeFilter, setEmployeeFilter] = useState('all');

  const loadData = () => {
    setTransactions(dataService.getTransactions());
    setMaterials(dataService.getMaterials());
    setSettings(dataService.getSettings());
  };

  useEffect(() => {
    const load = () => {
      loadData();
    };
    load();
    return dataService.subscribe(load);
  }, []);
`;

content = content.replace(insertionPoint, hookToAdd);
fs.writeFileSync('src/pages/Transactions.tsx', content);

console.log("loadData fixed!");
