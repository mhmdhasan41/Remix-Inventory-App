import os
import re

def analyze_directory(dir_path):
    results = []
    for root, _, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.tsx', '.jsx', '.ts', '.js')) and 'node_modules' not in root:
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Find TextFields
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if '<TextField' in line or '<input' in line:
                            # Extract some context (3 lines up, 7 lines down)
                            start = max(0, i - 3)
                            end = min(len(lines), i + 7)
                            context = '\n'.join(lines[start:end])
                            
                            # Simple heuristic for type and name/label
                            label_match = re.search(r'label={?["\']([^"\']+)["\']', context)
                            label = label_match.group(1) if label_match else 'Unknown Label'
                            
                            type_match = re.search(r'type={?["\']([^"\']+)["\']', context)
                            input_type = type_match.group(1) if type_match else 'text'
                            
                            name_match = re.search(r'name={?["\']([^"\']+)["\']', context)
                            name = name_match.group(1) if name_match else 'Unknown Name'
                            
                            val_match = re.search(r'value={', context)
                            controlled = 'Yes' if val_match else 'No'

                            results.append({
                                'file': file_path.replace(dir_path, ''),
                                'line': i + 1,
                                'label': label,
                                'name': name,
                                'type': input_type,
                                'controlled': controlled,
                                'context': context
                            })
    return results

results = analyze_directory('./src')
with open('inputs_report.md', 'w', encoding='utf-8') as f:
    f.write("# Input Fields Report\n\n")
    for r in results:
        f.write(f"### {r['file']} (Line {r['line']})\n")
        f.write(f"- **Label**: {r['label']}\n")
        f.write(f"- **Name**: {r['name']}\n")
        f.write(f"- **Type**: {r['type']}\n")
        f.write(f"- **Controlled**: {r['controlled']}\n")
        f.write("```tsx\n" + r['context'] + "\n```\n\n")

print(f"Found {len(results)} inputs.")
