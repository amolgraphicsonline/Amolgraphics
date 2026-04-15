import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add focusedSlotIdx state
if (!content.includes('const [focusedSlotIdx, setFocusedSlotIdx]')) {
    content = content.replace('const [isEditMode, setIsEditMode] = useState(false);', 
                              'const [isEditMode, setIsEditMode] = useState(false);\n  const [focusedSlotIdx, setFocusedSlotIdx] = useState<number | null>(null);');
}

// 2. Update Slots with onDoubleClick
// Left Side Slot
const leftSlotOld = /idx={currentSpreadIndex \* 2 - 1}/;
content = content.replace(leftSlotOld, 'idx={currentSpreadIndex * 2 - 1}\n                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx(currentSpreadIndex * 2 - 1); }}');

// Right Side Slot
const rightSlotOld = /idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}/;
content = content.replace(rightSlotOld, 'idx={currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2}\n                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx(currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2); }}');

// 3. Add Floating Toolbar to View 5
const toolbarAnchor = /{\/\* Edit Mode Hint \*\/}/;

const floatingToolbar = `{/* Floating Image Toolbar (Printshoppy Style) */}
                            {isEditMode && focusedSlotIdx !== null && uploadedPhotos[focusedSlotIdx] && (
                              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[80] animate-in slide-in-from-top-4 duration-300">
                                <div className="bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.25)] border border-slate-50 flex items-center gap-6">
                                  <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
                                    <button onClick={() => {
                                      const s = (uploadedPhotos[focusedSlotIdx]?.scale || 1) - 0.1;
                                      setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: Math.max(0.1, s) } }));
                                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors"><ZoomOut size={18} /></button>
                                    <span className="text-[10px] font-black w-8 text-center text-slate-900">{Math.round((uploadedPhotos[focusedSlotIdx]?.scale || 1) * 100)}%</span>
                                    <button onClick={() => {
                                      const s = (uploadedPhotos[focusedSlotIdx]?.scale || 1) + 0.1;
                                      setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: Math.min(10, s) } }));
                                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors"><ZoomIn size={18} /></button>
                                  </div>

                                  <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
                                    <button onClick={() => {
                                      const r = (uploadedPhotos[focusedSlotIdx]?.rotate || 0) - 90;
                                      setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], rotate: r } }));
                                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors"><RotateCcw size={18} /></button>
                                    <button onClick={() => {
                                      const r = (uploadedPhotos[focusedSlotIdx]?.rotate || 0) + 90;
                                      setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], rotate: r } }));
                                    }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors"><RotateCw size={18} /></button>
                                  </div>

                                  <div className="flex items-center gap-4">
                                     <button onClick={() => {
                                       if(fileInputRef.current) fileInputRef.current.click();
                                     }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors"><ImageIcon size={18} /></button>
                                     <button onClick={() => {
                                       setUploadedPhotos(prev => {
                                         const next = { ...prev };
                                         delete next[focusedSlotIdx];
                                         return next;
                                       });
                                       setFocusedSlotIdx(null);
                                     }} className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                     <button 
                                       onClick={() => { setIsEditMode(false); setFocusedSlotIdx(null); }}
                                       className="ml-4 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                     >
                                       Apply
                                     </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Edit Mode Hint */}`;

content = content.replace(toolbarAnchor, floatingToolbar);

fs.writeFileSync(filePath, content);
console.log('Successfully implemented Double Click Edit and Floating Toolbar');
