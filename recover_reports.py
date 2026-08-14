with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the injected original file
bad_marker = "</TableContainer>./utils"
marker_idx = content.find(bad_marker)

if marker_idx != -1:
    # The original file's content[21:] starts right after "</TableContainer>"
    original_part2 = content[marker_idx + 17:] # 17 is len("</TableContainer>")
    
    # We just need to reconstruct original
    # The original file's first 21 chars were lost, but wait, they are in the beginning of the file!
    original_part1 = content[:len(content) - len(original_part2)] # Wait, no.
    # The file starts with the original file! 
    # content = original[:start_idx] + new_section + original[end_idx:]
    # And end_idx was 21. 
    # So the original file is just content[:21] + original_part2 !
    original = content[:21] + original_part2
    
    with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
        f.write(original)
        
    print("Recovered original file.")
else:
    print("Marker not found, maybe already recovered?")

