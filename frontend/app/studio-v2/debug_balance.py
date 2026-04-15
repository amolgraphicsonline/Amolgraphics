import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    line_num = 1
    col_num = 0
    
    i = 0
    while i < len(content):
        char = content[i]
        col_num += 1
        
        if char == '\n':
            line_num += 1
            col_num = 0
            i += 1
            continue
            
        if char == '{':
            stack.append(('{', line_num, col_num))
        elif char == '(':
            stack.append(('(', line_num, col_num))
        elif char == '}':
            if not stack:
                print(f"Extra }} at line {line_num}:{col_num}")
                return
            last, ln, cn = stack.pop()
            if last != '{':
                print(f"Mismatched }} at line {line_num}:{col_num}, expected closing for {last} from line {ln}:{cn}")
                return
        elif char == ')':
            if not stack:
                print(f"Extra ) at line {line_num}:{col_num}")
                return
            last, ln, cn = stack.pop()
            if last != '(':
                print(f"Mismatched ) at line {line_num}:{col_num}, expected closing for {last} from line {ln}:{cn}")
                return
        elif char == '<':
            # Check for comments
            if content[i:i+4] == '<!--' or content[i:i+3] == '{/*':
                 # Skip comments (simple version)
                 pass
            
            # Check for tags
            if content[i:i+2] == '</':
                tag_end = content.find('>', i)
                tag_name = content[i+2:tag_end].strip()
                stack.append(('</' + tag_name, line_num, col_num))
                i = tag_end
            elif content[i:i+2] == '<>':
                stack.append(('<>', line_num, col_num))
                i += 1
            else:
                tag_end = content.find('>', i)
                if tag_end != -1:
                    tag_stuff = content[i+1:tag_end]
                    if not tag_stuff.endswith('/') and not tag_stuff.startswith('link') and not tag_stuff.startswith('img') and not tag_stuff.startswith('br') and not tag_stuff.startswith('input'):
                        tag_name = tag_stuff.split()[0]
                        stack.append(('<' + tag_name, line_num, col_num))
                    i = tag_end
        
        # This is a very rough script and will fail on many things like strings, regex, etc.
        # But for a huge file with many nested divs, it might show something.
        i += 1

    if stack:
        print("Final stack state:")
        for item, ln, cn in stack:
            print(f"Unclosed {item} from line {ln}:{cn}")
    else:
        print("Balanced (braces, parens, and simple tags)!")

if __name__ == "__main__":
    check_balance(sys.argv[1])
