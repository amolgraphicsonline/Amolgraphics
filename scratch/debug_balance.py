
import re

def find_mismatched_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    for line_num, line in enumerate(lines, 1):
        # We only care about { } ( ) [ ] and JSX tags for now
        # But let's focus on brackets first
        for char in line:
            if char in '{([':
                stack.append((char, line_num))
            elif char in '}])':
                if not stack:
                    print(f"Unexpected closing bracket {char} at line {line_num}")
                    return
                opening, op_line = stack.pop()
                if (opening == '{' and char != '}') or \
                   (opening == '(' and char != ')') or \
                   (opening == '[' and char != ']'):
                    print(f"Mismatched bracket {char} at line {line_num} (opened with {opening} at line {op_line})")
                    return
    
    if stack:
        for char, line_num in stack:
            print(f"Unclosed bracket {char} from line {line_num}")
    else:
        print("Brackets are balanced.")

def find_mismatched_jsx(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Very naive JSX tag matcher
    # Looks for <Tag> or <Tag ...> or <> or </Tag> or </>
    # Excludes self-closing <Tag />
    tags = re.findall(r'<(?!/)([a-zA-Z0-9\.]+|)(?:\s+[^>]*|)>|</([a-zA-Z0-9\.]+|)>', content)
    
    stack = []
    line_starts = [0]
    for m in re.finditer('\n', content):
        line_starts.append(m.start() + 1)

    def get_line(pos):
        import bisect
        return bisect.bisect_right(line_starts, pos)

    for m in re.finditer(r'<(?!/)([a-zA-Z0-9\.]*|)(?:\s+[^>]*[^/]|)>|</([a-zA-Z0-9\.]*|)>', content):
        full_tag = m.group(0)
        line_num = get_line(m.start())
        
        if full_tag.startswith('</'):
            tag_name = m.group(2)
            if not stack:
                print(f"Unexpected closing tag {full_tag} at line {line_num}")
                return
            opening_name, op_line = stack.pop()
            if tag_name != opening_name:
                print(f"Mismatched tag {full_tag} at line {line_num} (opened with <{opening_name}> at line {op_line})")
                return
        else:
            # Check if self-closing
            if full_tag.endswith('/>'):
                continue
            tag_name = m.group(1)
            stack.append((tag_name, line_num))
            
    if stack:
        for name, line in stack:
            print(f"Unclosed tag <{name}> from line {line}")
    else:
        print("JSX tags are balanced.")

import sys
if len(sys.argv) > 1:
    print("Checking brackets:")
    find_mismatched_brackets(sys.argv[1])
    print("\nChecking JSX:")
    find_mismatched_jsx(sys.argv[1])
