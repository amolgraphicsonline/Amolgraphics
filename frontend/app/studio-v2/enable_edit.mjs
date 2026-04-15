import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isEditMode state
if (!content.includes('const [isEditMode, setIsEditMode]')) {
    content = content.replace('const [isUploading, setIsUploading] = useState(false);', 
                              'const [isUploading, setIsUploading] = useState(false);\n  const [isEditMode, setIsEditMode] = useState(false);');
}

// 2. Make Edit button functional
const editBtnRegex = /<button className="flex flex-col items-center gap-0.5 text-\[#FF6B35\]">[\s\S]*?<LucideEdit size={18} \/>[\s\S]*?<span className="text-\[7px\] font-black uppercase tracking-widest">Edit<\/span>[\s\S]*?<\/button>/;

const newEditBtn = `<button 
                              onClick={() => setIsEditMode(!isEditMode)}
                              className={\`flex flex-col items-center gap-0.5 transition-all \${isEditMode ? 'text-blue-500 scale-110 font-bold' : 'text-[#FF6B35]'}\`}
                            >
                               <LucideEdit size={18} />
                               <span className="text-[7px] font-black uppercase tracking-widest">{isEditMode ? 'DONE' : 'Edit'}</span>
                            </button>`;

if (editBtnRegex.test(content)) {
    content = content.replace(editBtnRegex, newEditBtn);
} else {
    // String fallback if regex fails due to line breaks
    const searchStr = '<span className="text-[7px] font-black uppercase tracking-widest">Edit</span>';
    const replaceStr = '<span className="text-[7px] font-black uppercase tracking-widest">{isEditMode ? "DONE" : "Edit"}</span>';
    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        const parentRegex = /<button className="flex flex-col items-center gap-0.5 text-\[#FF6B35\]">/;
        content = content.replace(parentRegex, `<button onClick={() => setIsEditMode(!isEditMode)} className={\`flex flex-col items-center gap-1 transition-all \${isEditMode ? "text-blue-500 scale-110" : "text-[#FF6B35]"}\`}>`);
    }
}

// 3. Integrate Slot component for Left Side spread
const leftImgRegex = /<img src={resolveMedia\(uploadedPhotos\[currentSpreadIndex \* 2\]\.url, API_URL\)} className="w-full h-full object-cover transition-transform duration-700 group-hover\/page:scale-105" \/>/;

const leftSlot = `<Slot 
                                      idx={currentSpreadIndex * 2}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />`;

content = content.replace(leftImgRegex, leftSlot);

// 4. Integrate Slot component for Right Side spread
const rightImgRegex = /<img src={resolveMedia\(uploadedPhotos\[currentSpreadIndex \* 2 \+ 1\]\.url, API_URL\)} className="w-full h-full object-cover transition-transform duration-700 group-hover\/page:scale-105" \/>/;

const rightSlot = `<Slot 
                                      idx={currentSpreadIndex * 2 + 1}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />`;

content = content.replace(rightImgRegex, rightSlot);

// 5. Add Edit Mode Hint
const hintAnchor = /<span className={currentSpreadIndex === 0 \? 'text-\[#1877F2\]' : ''}>{currentSpreadIndex === 0 \? 'Front cover' : `Page \${currentSpreadIndex \* 2}`}<\/span>\s*<\/div>/;

const newHint = `<span className={currentSpreadIndex === 0 ? 'text-[#1877F2]' : ''}>{currentSpreadIndex === 0 ? 'Front cover' : \`Page \${currentSpreadIndex * 2}\`}</span>
                            </div>

                            {/* Edit Mode Hint */}
                            {isEditMode && (
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] bg-[#1877F2] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                                <Move size={14} /> Drag image to adjust position | Scroll to Zoom
                              </div>
                            )}`;

content = content.replace(hintAnchor, newHint);

fs.writeFileSync(filePath, content);
console.log('Successfully re-applied all Edit mode fixes');
