import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startTag = '{/* Professional Image Adjustment Toolbar (Mega Version) */}';
const endTag = '{/* Section 6: Action Trio */}';

// I'll replace the problematic block with a clean version.

const cleanToolbarPart = `{/* Professional Image Adjustment Toolbar (Mega Version) */}
                            {isEditMode && focusedSlotIdx !== null && uploadedPhotos[focusedSlotIdx] && (
                              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-500">
                                <div className="bg-white/95 backdrop-blur-3xl px-8 py-4 rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.3)] border border-white/50 flex items-center gap-4">
                                  
                                  {/* Section 1: Replace & Aspect */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button 
                                      title="Replace Image"
                                      onClick={() => fileInputRef.current?.click()} 
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all hover:scale-110"
                                    ><ImageIcon size={20} /></button>
                                    <button 
                                      title="Fit/Fill Toggle"
                                      onClick={() => {
                                        const s = (uploadedPhotos[focusedSlotIdx]?.scale || 1) > 1.2 ? 1 : 1.5;
                                        setUploadedPhotos(prev => { 
                                          const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                          return { ...prev, [focusedSlotIdx]: { ...cur, scale: s } };
                                        });
                                      }}
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all hover:scale-110"
                                    ><Maximize size={20} /></button>
                                  </div>

                                  {/* Section 2: Zoom Duo */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button onClick={() => setUploadedPhotos(prev => { 
                                      const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                      return { ...prev, [focusedSlotIdx]: { ...cur, scale: Math.max(0.1, (cur.scale || 1) - 0.1) } };
                                    })} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><ZoomOut size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => { 
                                      const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                      return { ...prev, [focusedSlotIdx]: { ...cur, scale: Math.min(10, (cur.scale || 1) + 0.1) } };
                                    })} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><ZoomIn size={20} /></button>
                                  </div>

                                  {/* Section 3: Orientation Trio */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button onClick={() => setUploadedPhotos(prev => { 
                                      const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                      return { ...prev, [focusedSlotIdx]: { ...cur, scale: 2 } };
                                    })} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><Maximize2 size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => { 
                                      const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                      return { ...prev, [focusedSlotIdx]: { ...cur, rotate: (cur.rotate || 0) - 90 } };
                                    })} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><RotateCcw size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => { 
                                      const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                      return { ...prev, [focusedSlotIdx]: { ...cur, rotate: (cur.rotate || 0) + 90 } };
                                    })} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><RotateCw size={20} /></button>
                                    <button 
                                      title="Flip Horizontal"
                                      onClick={() => setUploadedPhotos(prev => { 
                                        const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                        return { ...prev, [focusedSlotIdx]: { ...cur, flipX: !cur.flipX } };
                                      })} 
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"
                                    ><ArrowRight size={20} className={uploadedPhotos[focusedSlotIdx].flipX ? 'scale-x-[-1]' : ''} /></button>
                                  </div>

                                  {/* Section 4: Filters & Layers */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button 
                                      title="Adjustment Filters"
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"
                                    ><Palette size={20} /></button>
                                    <button 
                                      title="Layer Depth"
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"
                                    ><Layers size={20} /></button>
                                  </div>

                                  {/* Section 5: Slider Controls */}
                                  <div className="flex items-center gap-4 px-4 bg-slate-50/50 rounded-2xl py-2">
                                    <span className="text-[10px] font-black w-8 text-slate-900">{Math.round((uploadedPhotos[focusedSlotIdx]?.scale || 1) * 100)}%</span>
                                    <input 
                                      type="range" 
                                      min="0.5" max="5" step="0.1" 
                                      value={uploadedPhotos[focusedSlotIdx]?.scale || 1}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setUploadedPhotos(prev => {
                                          const cur = typeof prev[focusedSlotIdx] === "string" ? { url: prev[focusedSlotIdx], scale: 1, x: 0, y: 0, rotate: 0 } : prev[focusedSlotIdx];
                                          return { ...prev, [focusedSlotIdx]: { ...cur, scale: val } };
                                        });
                                      }}
                                      className="w-24 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                  </div>

                                  {/* Section 6: Action Trio */}`;

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + cleanToolbarPart + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent);
    console.log('Successfully cleaned up toolbar syntax');
} else {
    console.log('Could not find toolbar tags');
}
