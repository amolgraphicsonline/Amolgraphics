import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. POLISH THE BACK COVER (Spread 0 Left Side)
const backCoverOld = /currentSpreadIndex === 0 \? \(\s*<div className="w-full h-full flex flex-col items-center justify-between py-12 px-8 select-none">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*: uploadedPhotos/;

const backCoverNew = `currentSpreadIndex === 0 ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 select-none space-y-12">
                                      <div className="flex flex-col items-center gap-6 group/logo">
                                        <div className="w-24 h-24 relative flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-110">
                                          {globalSettings?.logo ? (
                                            <img src={resolveMedia(globalSettings.logo, API_URL)} className="w-full h-full object-contain drop-shadow-xl" alt="Brand Logo" />
                                          ) : (
                                            <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl italic shadow-xl">A</div>
                                          )}
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-black italic tracking-tighter text-slate-900">
                                            Amol <span className="text-[#1877F2]">Graphics</span>
                                          </div>
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1 block">Premium Printing Studio</span>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-center text-center gap-3">
                                        <div className="w-12 h-px bg-slate-100" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[280px] leading-loose">
                                          {globalSettings?.contactAddress || globalSettings?.address || 'Shop No. 01, Heramb Apartment, 501/2, Opp. DSK Chintamani, Pate-Sampada, Shaniwar Peth, Pune, Maharashtra 411030'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                           <span className="text-[9px] font-black text-slate-200">Quality Assured</span>
                                           <div className="w-1 h-1 bg-slate-100 rounded-full" />
                                           <span className="text-[9px] font-black text-slate-200">Est. 1995</span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : uploadedPhotos`;

content = content.replace(backCoverOld, backCoverNew);

// 2. IMPLEMENT THE PROFESSIONAL TOOLBAR
const toolbarOld = /{\/\* Floating Image Toolbar \(Printshoppy Style\) \*\/\}\s*{isEditMode && focusedSlotIdx !== null && uploadedPhotos\[focusedSlotIdx\] && \([\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)}/;

const toolbarNew = `{/* Professional Image Adjustment Toolbar (Mega Version) */}
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
                                        setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: s } }));
                                      }}
                                      className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all hover:scale-110"
                                    ><Maximize size={20} /></button>
                                  </div>

                                  {/* Section 2: Zoom Duo */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: Math.max(0.1, (prev[focusedSlotIdx].scale || 1) - 0.1) } }))} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><ZoomOut size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: Math.min(10, (prev[focusedSlotIdx].scale || 1) + 0.1) } }))} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><ZoomIn size={20} /></button>
                                  </div>

                                  {/* Section 3: Orientation Trio */}
                                  <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    <button onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: 2 } }))} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><Maximize2 size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], rotate: (prev[focusedSlotIdx].rotate || 0) - 90 } }))} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><RotateCcw size={20} /></button>
                                    <button onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], rotate: (prev[focusedSlotIdx].rotate || 0) + 90 } }))} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"><RotateCw size={20} /></button>
                                    <button 
                                      title="Flip Horizontal"
                                      onClick={() => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], flipX: !prev[focusedSlotIdx].flipX } }))} 
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
                                      onChange={(e) => setUploadedPhotos(prev => ({ ...prev, [focusedSlotIdx]: { ...prev[focusedSlotIdx], scale: parseFloat(e.target.value) } }))}
                                      className="w-24 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                  </div>

                                  {/* Section 6: Action Trio */}
                                  <div className="flex items-center gap-2 pl-4">
                                     <button 
                                       title="Auto Adjust"
                                       className="p-3 bg-blue-50 text-blue-600 rounded-2xl transition-all hover:bg-blue-100"
                                     ><Sparkles size={20} /></button>
                                     <button onClick={() => { setUploadedPhotos(prev => { const n = {...prev}; delete n[focusedSlotIdx]; return n; }); setFocusedSlotIdx(null); }} className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                     <button 
                                       onClick={() => { setIsEditMode(false); setFocusedSlotIdx(null); }}
                                       className="ml-4 px-8 py-3 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all hover:shadow-xl active:scale-95"
                                     >Apply</button>
                                  </div>

                                </div>
                              </div>
                            )}`;

content = content.replace(toolbarOld, toolbarNew);

// 3. UNBLOCK RIGHT SIDE (Remove outer group/page and fix ternary integrity)
const rightSideOuterOld = /<div className="w-full h-full bg-slate-50\/50 rounded-xs flex flex-col items-center justify-center group\/page overflow-hidden border border-slate-50">/;
const rightSideOuterNew = '<div className="w-full h-full bg-slate-50/50 rounded-xs flex flex-col items-center justify-center overflow-hidden border border-slate-50">';
content = content.replace(rightSideOuterOld, rightSideOuterNew);

fs.writeFileSync(filePath, content);
console.log('Successfully implemented professional toolbar and back cover branding');
