import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. FIX REPLACE IMAGE FUNCTIONALITY
// I'll add a specialized hidden input specifically for Slot Replacement to avoid interfering with bulk uploads.
const hiddenInputHtml = '<input type="file" ref={replaceInputRef} onChange={handleReplacePhoto} className="hidden" accept="image/*" />';
const mainWrapperStart = '<main className="flex-1 relative flex flex-col items-center justify-center p-6 bg-[#f0f1f3] overflow-hidden">';
content = content.replace(mainWrapperStart, `${hiddenInputHtml}\n                          ${mainWrapperStart}`);

// 2. DEFINE replaceInputRef AND handleReplacePhoto
const refsInsertPoint = 'const fileInputRef = useRef<HTMLInputElement>(null);';
const newRefs = `const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  
  const handleReplacePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && focusedSlotIdx !== null) {
      await handlePhotoUpload(focusedSlotIdx, file);
      // Reset input so picking the same file again triggers change
      e.target.value = '';
    }
  };`;
content = content.replace(refsInsertPoint, newRefs);

// 3. UPDATE TOOLBAR BUTTONS (Link to replaceInputRef and Remove junk)
const toolbarReplaceOld = 'onClick={() => fileInputRef.current?.click()}';
const toolbarReplaceNew = 'onClick={() => replaceInputRef.current?.click()}';
content = content.replace(toolbarReplaceOld, toolbarReplaceNew);

// Remove Section 4 (Filters & Layers)
const section4Range = /{\/\* Section 4: Filters & Layers \*\/}\s*<div className="flex items-center gap-2 pr-4 border-r border-slate-100">[\s\S]*?<\/div>/;
content = content.replace(section4Range, '');

fs.writeFileSync(filePath, content);
console.log('Successfully refined toolbar: Replace Image fixed, non-functional features removed.');
