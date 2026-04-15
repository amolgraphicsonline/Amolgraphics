import sys

def check_depth(file_path, target_line):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    depth_curly = 0
    depth_paren = 0
    for i, line in enumerate(lines):
        if i + 1 == target_line:
            print(f"Depth at line {target_line}: Curly={depth_curly}, Paren={depth_paren}")
            break
        
        depth_curly += line.count('{') - line.count('}')
        depth_paren += line.count('(') - line.count(')')

if __name__ == "__main__":
    check_depth(sys.argv[1], int(sys.argv[2]))
