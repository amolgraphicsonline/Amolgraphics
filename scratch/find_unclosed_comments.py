import sys

def find_unclosed_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pos = 0
    while True:
        start = content.find('/*', pos)
        if start == -1: break
        
        end = content.find('*/', start + 2)
        if end == -1:
            line_num = content[:start].count('\n') + 1
            print(f"Unclosed '/*' at line {line_num}")
            pos = start + 2
        else:
            pos = end + 2

if __name__ == "__main__":
    find_unclosed_comments(sys.argv[1])
