import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. CLEAN UP LEFT SIDE (Move overlay into placeholder)
const leftPlaceholderOld = /}\s*<div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200 relative group\/page">[\s\S]*?<\/div>(\s*<\/div>\s*<\/div>)/;

// I'll use a more precise match
const leftSlotBlockOld = /uploadedPhotos\[\(currentSpreadIndex - 1\) \* 2\] \? \([\s\S]*?<Slot[\s\S]*?\/>\s*\) : \([\s\S]*?handlePhotoUpload\(\(currentSpreadIndex - 1\) \* 2[\s\S]*?<\/div>\s*<\/div>\s*\)\s*\)\}/;

// 2. CLEAN UP RIGHT SIDE (Move overlay into placeholder)
// Find the Right Side spread area and ensure the overlay is only inside the "no photo" branch
const rightSpreadOld = /<div className="w-full h-full bg-slate-50\/50 rounded-xs flex flex-col items-center justify-center group\/page overflow-hidden border border-slate-50">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// Actually, I'll just rewrite the Spread block from 1524 to 1604 carefully.
// This is the safest way to ensure layout integrity.

// 3. I'll read the whole block again to make sure I have the boundaries.
console.log("Re-reading workbench section...");
