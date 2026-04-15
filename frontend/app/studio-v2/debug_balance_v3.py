
import sys

def check_balance(filepath):
    content = open(filepath, 'r', encoding='utf-8').read()
    
    counts = {char: 0 for char in ['{', '}', '(', ')', '[', ']', '<', '>']}
    for char in content:
        if char in counts:
            counts[char] += 1
            
    print("Character counts:")
    for char, count in counts.items():
        print(f"  {char}: {count}")
        
    stack = []
    for i, char in enumerate(content):
        if char == '{': stack.append(('{', i))
        elif char == '}':
            if stack and stack[-1][0] == '{': stack.pop()
            else: print(f"Extra }} at index {i} (line {content.count('\n', 0, i)+1})")
            
    if stack:
        for char, idx in stack:
            print(f"Unclosed {char} at index {idx} (line {content.count('\n', 0, idx)+1}): {content[idx:idx+40].strip()}...")

    stack_p = []
    for i, char in enumerate(content):
        if char == '(': stack_p.append(('(', i))
        elif char == ')':
            if stack_p and stack_p[-1][0] == '(': stack_p.pop()
            else: print(f"Extra ) at index {i} (line {content.count('\n', 0, i)+1})")
            
    if stack_p:
        for char, idx in stack_p:
            print(f"Unclosed {char} at index {idx} (line {content.count('\n', 0, idx)+1}): {content[idx:idx+40].strip()}...")

check_balance('c:/Gaurav/Antigravity/software/AmolGraphics/frontend/app/studio-v2/page.tsx')
