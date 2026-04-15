import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. RESTRUCTURE RIGHT SIDE (FRONT COVER + INTERIOR)
const rightSideOld = /\{uploadedPhotos\[currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2\] \? \([\s\S]*?idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}[\s\S]*?\/>\s*\) : \([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

// Wait, the regex above is too broad and risky. Let's do it part by part.

// PART A: Right side Slot and Condition
const rightSlotOld = /uploadedPhotos\[currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2\] \? \(\s*<Slot\s*idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}/;
const rightSlotNew = 'currentSpreadIndex === 0 ? (\n                                    <div className="w-full h-full relative group/design overflow-hidden">\n                                       {selectedDesign?.previewImage && (\n                                         <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/design:scale-105" alt="Design Preview" />\n                                       )}\n                                       <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 border-t border-slate-100/50">\n                                          <div className="space-y-1">\n                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] block">Cover Design</span>\n                                            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest block">{selectedDesign?.name || "Premium Design"}</span>\n                                          </div>\n                                       </div>\n                                    </div>\n                                  ) : uploadedPhotos[(currentSpreadIndex - 1) * 2 + 1] ? (\n                                    <Slot \n                                      idx={(currentSpreadIndex - 1) * 2 + 1}';

content = content.replace(rightSlotOld, rightSlotNew);

// PART B: Remove old placeholder logic for Right side (it's now handled by ternary)
const rightPlaceholderOld = /: \(\s*<div className="w-full h-full relative group\/design">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)/;
content = content.replace(rightPlaceholderOld, ': null)');

// PART C: Left side mapping
const leftSlotOld = /uploadedPhotos\[currentSpreadIndex \* 2 - 1\] \? \(\s*<Slot\s*idx={currentSpreadIndex \* 2 - 1}/;
const leftSlotNew = 'uploadedPhotos[(currentSpreadIndex - 1) * 2] ? (\n                                    <Slot \n                                      idx={(currentSpreadIndex - 1) * 2}';
content = content.replace(leftSlotOld, leftSlotNew);

// 2. FIX EVENT HANDLERS
content = content.replace(/setFocusedSlotIdx\(currentSpreadIndex \* 2 - 1\)/g, 'setFocusedSlotIdx((currentSpreadIndex - 1) * 2)');
content = content.replace(/setFocusedSlotIdx\(currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2\)/g, 'setFocusedSlotIdx((currentSpreadIndex - 1) * 2 + 1)');
content = content.replace(/handlePhotoUpload\(currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2/g, 'handlePhotoUpload((currentSpreadIndex - 1) * 2 + 1');

// 3. FIX FOOTER THUMBNAILS
// Left side
content = content.replace(/uploadedPhotos\[idx \* 2 - 1\]/g, 'uploadedPhotos[(idx - 1) * 2]');
// Right side
const footerRightOld = /\{uploadedPhotos\[idx === 0 \? 0 : idx \* 2\] && <img src={resolveMedia\(uploadedPhotos\[idx === 0 \? 0 : idx \* 2\]\.url, API_URL\)} className="w-full h-full object-cover" \/>\}/;
const footerRightNew = `{idx === 0 ? (selectedDesign && <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="w-full h-full object-cover" />) : (uploadedPhotos[(idx - 1) * 2 + 1] && <img src={resolveMedia(uploadedPhotos[(idx - 1) * 2 + 1].url, API_URL)} className="w-full h-full object-cover" />)}`;
content = content.replace(footerRightOld, footerRightNew);

fs.writeFileSync(filePath, content);
console.log('Successfully applied consolidated fixes without corruption');
