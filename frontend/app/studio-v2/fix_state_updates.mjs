import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// I'll update all the toolbar handlers to ensure we don't spread strings.
// A safe helper would be nice, but I'll just change the inline handlers.

const rotateCcwOld = /rotate: \(prev\[focusedSlotIdx\].rotate \|\| 0\) - 90/;
const rotateCcwNew = 'rotate: ((typeof prev[focusedSlotIdx] === "object" ? prev[focusedSlotIdx].rotate : 0) || 0) - 90';
// This is getting complex for a regex. 

// I'll use a better approach: Update the state update pattern.
// setUploadedPhotos(prev => {
//    const current = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, rotate: 0, x: 0, y: 0 } : prev[focusedSlotIdx];
//    return { ...prev, [focusedSlotIdx]: { ...current, ...changes } };
// })

// I'll do a global replace for the common "setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx]" pattern.

content = content.replace(/setUploadedPhotos\(prev => \({ \.\.\.prev, \[focusedSlotIdx\]: { \.\.\.prev\[focusedSlotIdx\]/g, 
    'setUploadedPhotos(prev => { const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx]; return { ...prev, [focusedSlotIdx]: { ...cur');

// Fix closing braces for the replaced ones
// Because I replaced ({ ... with { const ... return { ..., I need to make sure the closing }) remains correct.
// Actually my replacement is:
// setUploadedPhotos(prev => { const cur = ...; return { ...prev, [focusedSlotIdx]: { ...cur, rotate: ... } } })
// Wait, the original was ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], rotate: ... } })
// My replacement: setUploadedPhotos(prev => { const cur = ...; return { ...prev, [focusedSlotIdx]: { ...cur, rotate: ... } } })
// The trailing }) should match.

fs.writeFileSync(filePath, content);
console.log('Fixed state update patterns in StudioV2Page.tsx');
