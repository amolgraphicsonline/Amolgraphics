import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Surgical replacement for LEFT side spread photo logic
const leftSideOld = /uploadedPhotos\[currentSpreadIndex \* 2\] \? \(\s*<Slot\s*idx={currentSpreadIndex \* 2 - 1}/;
const leftSideNew = 'uploadedPhotos[currentSpreadIndex * 2 - 1] ? (\n                                    <Slot \n                                      idx={currentSpreadIndex * 2 - 1}';

content = content.replace(leftSideOld, leftSideNew);

// Surgical replacement for RIGHT side spread photo logic
const rightSideOld = /uploadedPhotos\[currentSpreadIndex \* 2 \+ 1\] \? \(\s*<Slot\s*idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}/;
const rightSideNew = 'uploadedPhotos[currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2] ? (\n                                    <Slot \n                                      idx={currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2}';

content = content.replace(rightSideOld, rightSideNew);

// Also fix the right side design/placeholder block condition
// currentSpreadIndex * 2 + 1 should be shifted to currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2
const rightCondOld = /uploadedPhotos\[currentSpreadIndex \* 2 \+ 1\] \? \(/;
content = content.replace(rightCondOld, 'uploadedPhotos[currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2] ? (');

fs.writeFileSync(filePath, content);
console.log('Successfully synchronized photo conditions with slot indices');
