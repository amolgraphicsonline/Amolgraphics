import sys

def check_div_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    line_num = 0
    for line in lines:
        line_num += 1
        # Match <div or <Link or <main or <section
        # Match </div or </Link or </main or </section
        
        trimmed = line.strip()
        if trimmed.startswith('<div') and not trimmed.endswith('/>'):
            stack.append(('div', line_num))
        elif trimmed.startswith('</div'):
            if not stack:
                print(f"Extra </div> at line {line_num}")
                continue
            last, ln = stack.pop()
            if last != 'div':
                print(f"Mismatched </div> at line {line_num}, expected closing for {last} from line {ln}")
        
    if stack:
        print("Unclosed tags:")
        for item, ln in stack:
            print(f"Unclosed {item} from line {ln}")
    else:
        print("Tags balanced (rough check)!")

if __name__ == "__main__":
    check_div_balance(sys.argv[1])
