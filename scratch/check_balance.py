import sys

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(('{', i+1))
            elif char == '}':
                if not stack:
                    print(f"Extra '}}' at line {i+1}")
                else:
                    stack.pop()
            elif char == '(':
                stack.append(('(', i+1))
            elif char == ')':
                if not stack:
                    print(f"Extra ')' at line {i+1}")
                else:
                    item, line_num = stack.pop()
                    if item != '(':
                        print(f"Mismatched ')' at line {i+1}, expected '}}' for line {line_num}")
    
    while stack:
        item, line_num = stack.pop()
        print(f"Unclosed '{item}' from line {line_num}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
