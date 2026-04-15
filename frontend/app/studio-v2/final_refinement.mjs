import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. FIX ADD PHOTO REGRESSION
// The button at line 1199 was incorrectly changed to replaceInputRef.
// I'll change it back to fileInputRef.
const uploadButtonOld = 'onClick={() => replaceInputRef.current?.click()} className="w-full h-20 bg-[#FF6B35]';
const uploadButtonNew = 'onClick={() => fileInputRef.current?.click()} className="w-full h-20 bg-[#FF6B35]';
content = content.replace(uploadButtonOld, uploadButtonNew);

// 2. ENSURE TOOLBAR USES replaceInputRef
// I replaced it earlier but the regex might have been imprecise or it didn't hit the right one.
// I'll do a surgical replacement for the toolbar specifically.
const toolbarReplaceOld = '{/* Section 1: Replace & Aspect */}\\s*<div className="flex items-center gap-2 pr-4 border-r border-slate-100">\\s*<button \\s*title="Replace Image"\\s*onClick={() => fileInputRef.current\\?\\.click()}';
const toolbarReplaceRegex = new RegExp(toolbarReplaceOld);
const toolbarReplaceNewAction = '{/* Section 1: Replace & Aspect */}\n                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">\n                                    <button \n                                      title="Replace Image"\n                                      onClick={() => replaceInputRef.current?.click()}';
content = content.replace(toolbarReplaceRegex, toolbarReplaceNewAction);

// 3. REDUCE BACK COVER SIZE (1x Reduction)
content = content.replace('w-40 h-40 relative flex items-center justify-center', 'w-24 h-24 relative flex items-center justify-center');
content = content.replace('text-4xl font-black italic tracking-tighter', 'text-2xl font-black italic tracking-tighter');
content = content.replace('<span className="text-[14px] font-black text-[#1877F2]/40', '<span className="text-[10px] font-black text-[#1877F2]/30');
content = content.replace('text-2xl font-black text-[#1877F2] uppercase tracking-normal max-w-[500px] leading-[1.4]', 'text-lg font-black text-[#1877F2] uppercase tracking-normal max-w-[320px] leading-relaxed');
content = content.replace('w-20 h-1.5 bg-[#1877F2]', 'w-12 h-1 bg-[#1877F2]');

fs.writeFileSync(filePath, content);
console.log('Successfully fixed Add Photo regression and reduced Back Cover size.');
