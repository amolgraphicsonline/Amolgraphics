import sys

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    for i, char in enumerate(content):
        if char == '{':
            stack.append(('{', i))
        elif char == '}':
            if not stack:
                print(f"Extra '}}' near index {i}")
            else:
                top, pos = stack.pop()
                if top != '{':
                    print(f"Mismatched '}}' near index {i}, expected matching '{top}' from index {pos}")
        elif char == '(':
            stack.append(('(', i))
        elif char == ')':
            if not stack:
                print(f"Extra ')' near index {i}")
            else:
                top, pos = stack.pop()
                if top != '(':
                    print(f"Mismatched ')' near index {i}, expected matching '{top}' from index {pos}")
    
    for top, pos in stack:
        # Find line number for pos
        line_num = content[:pos].count('\n') + 1
        print(f"Unclosed '{top}' from line {line_num}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
