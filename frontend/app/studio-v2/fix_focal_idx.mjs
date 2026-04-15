import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the onDoubleClick index for left side
content = content.replace(/idx={\(currentSpreadIndex - 1\) \* 2}\s*onDoubleClick={\(\) => { setIsEditMode\(true\); setFocusedSlotIdx\(currentSpreadIndex \* 2 - 1\); }}/g, 
                        'idx={(currentSpreadIndex - 1) * 2}\n                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx((currentSpreadIndex - 1) * 2); }}');

fs.writeFileSync(filePath, content);
console.log('Fixed focusedSlotIdx mapping in double-click handlers');
