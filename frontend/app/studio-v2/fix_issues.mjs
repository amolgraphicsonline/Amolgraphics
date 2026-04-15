import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. FIX SYNTAX ERROR (Extra </div> from previous script)
// We need to find the double </div> after the labels and before the visualization
// Visualization starts with <div className="w-full h-full bg-white shadow...
const badHintMatch = /Page \${currentSpreadIndex \* 2}`}<\/span>\s*<\/div>\s*<\/div>\s*{\/\* Edit Mode Hint \*\/}/;
if (badHintMatch.test(content)) {
    content = content.replace(badHintMatch, 'Page ${currentSpreadIndex * 2}`}</span>\n                            </div>\n\n                            {/* Edit Mode Hint */}');
    console.log('Fixed extra </div> syntax error');
}

// 2. FIX PHOTO MAPPING (4 images vs 3 images)
// Change Left Side Slot in spread
// Old: idx={currentSpreadIndex * 2}
// New: idx={currentSpreadIndex * 2 - 1}
content = content.replace(/idx={currentSpreadIndex \* 2}/g, 'idx={currentSpreadIndex * 2 - 1}');

// Change Right Side Slot in spread
// Old: idx={currentSpreadIndex * 2 + 1}
// New: idx={currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2}
content = content.replace(/idx={currentSpreadIndex \* 2 \+ 1}/g, 'idx={currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2}');

// Fix the manual upload handlers in the spread
content = content.replace(/handlePhotoUpload\(currentSpreadIndex \* 2 \+ 1/g, 'handlePhotoUpload(currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2');

// Fix the footer thumbnails mapping
// Left side thumbnail: idx === 0 ? ... : uploadedPhotos[idx * 2]
// Change to: idx === 0 ? ... : uploadedPhotos[idx * 2 - 1]
content = content.replace(/uploadedPhotos\[idx \* 2\]/g, 'uploadedPhotos[idx * 2 - 1]');

// Right side thumbnail: uploadedPhotos[idx * 2 + 1]
// Change to: uploadedPhotos[idx === 0 ? 0 : idx * 2]
content = content.replace(/uploadedPhotos\[idx \* 2 \+ 1\]/g, 'uploadedPhotos[idx === 0 ? 0 : idx * 2]');


// 3. INTERNAL COVER LABELS
// Add label overlays inside the Slot/Logo areas for Spread 0
const backCoverLabel = '<div className="absolute top-4 left-4 z-20 bg-black/60 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">Back Cover</div>';
const frontCoverLabel = '<div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">Front Cover</div>';

// Insert Back Cover Label in the Left Side (Back Cover)
content = content.replace(/(<div className="flex-1 border-r border-slate-100\/50 p-6 relative">)/, `$1\n                                  {currentSpreadIndex === 0 && ${backCoverLabel}}`);

// Insert Front Cover Label in the Right Side (Front Cover)
content = content.replace(/(<div className="flex-1 p-6 relative">)/, `$1\n                                  {currentSpreadIndex === 0 && ${frontCoverLabel}}`);

fs.writeFileSync(filePath, content);
console.log('Successfully patched syntax error, photo mapping, and internal cover labels');
