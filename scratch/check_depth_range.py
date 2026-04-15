import sys

def check_depth_range(file_path, start, end):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    depth_curly = 0
    depth_paren = 0
    for i, line in enumerate(lines):
        line_num = i + 1
        if line_num >= start and line_num <= end:
            print(f"Line {line_num}: C={depth_curly}, P={depth_paren} | {line.strip()}")
        
        depth_curly += line.count('{') - line.count('}')
        depth_paren += line.count('(') - line.count(')')
        if line_num == end: break

if __name__ == "__main__":
    check_depth_range(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
