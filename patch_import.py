with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import LocalOfferIcon from '@mui/icons-material/LocalOffer';", "import LocalOfferIcon from '@mui/icons-material/LocalOffer';\nimport FilterAltOffIcon from '@mui/icons-material/FilterAltOff';")

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
