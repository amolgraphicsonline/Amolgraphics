import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. POPULATE THE THEME (DESIGNS) SIDEBAR
const themeSidebarHtml = `                              {activeTab === 'theme' && (
                                <div className="grid grid-cols-2 gap-3">
                                  {designs.map((d, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => setSelectedDesign(d)}
                                      className={\`group aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all \${selectedDesign?.id === d.id ? 'border-[#1877F2] shadow-lg' : 'border-slate-100 hover:border-blue-200'}\`}
                                    >
                                      <div className="w-full h-full relative">
                                        <img src={resolveMedia(d.previewImage, API_URL)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                                          <p className="text-[7px] font-black text-white uppercase truncate">{d.name}</p>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}`;

// 2. POPULATE THE SIZE SIDEBAR
const sizeSidebarHtml = `                              {activeTab === 'size' && (
                                <div className="space-y-3">
                                  {sizeOptions.map((s, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => setSelectedSize(s)}
                                      className={\`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group \${selectedSize?.label === s.label ? 'border-[#1877F2] bg-blue-50' : 'border-slate-100 hover:border-blue-100'}\`}
                                    >
                                      <div className="flex flex-col items-start gap-1">
                                        <span className={\`text-[10px] font-black uppercase tracking-tight \${selectedSize?.label === s.label ? 'text-[#1877F2]' : 'text-slate-900'}\`}>{s.label}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Premium Paper</span>
                                      </div>
                                      <div className={\`px-3 py-1 rounded-full text-[9px] font-black \${selectedSize?.label === s.label ? 'bg-[#1877F2] text-white' : 'bg-slate-100 text-slate-600'}\`}>
                                        ₹{s.price}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}`;

// 3. POPULATE THE TEXT SIDEBAR
const textSidebarHtml = `                              {activeTab === 'text' && (
                                <div className="space-y-6">
                                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="text-[10px] font-black text-slate-900 uppercase">Quick Add</p>
                                    <button className="w-full h-12 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase text-slate-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-all">Add Headline</button>
                                    <button className="w-full h-10 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-400 hover:text-[#1877F2] transition-all">Add Subtitle</button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {['Poppins', 'Playfair', 'Inter', 'Roboto'].map(f => (
                                      <button key={f} className="h-10 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50">{f}</button>
                                    ))}
                                  </div>
                                </div>
                              )}`;

const placeholderTag = '{(!activeTab || (activeTab !== \'images\' && activeTab !== \'layouts\')) && (';
const newContent = `${themeSidebarHtml}\n\n${sizeSidebarHtml}\n\n${textSidebarHtml}\n\n                              ${placeholderTag}`;
content = content.replace(placeholderTag, newContent);

// Also fix the placeholder logic to exclude implemented tabs
content = content.replace(
  '(activeTab !== \'images\' && activeTab !== \'layouts\')',
  '(activeTab !== \'images\' && activeTab !== \'layouts\' && activeTab !== \'theme\' && activeTab !== \'size\' && activeTab !== \'text\')'
);

fs.writeFileSync(filePath, content);
console.log('Successfully populated Theme, Size, and Text sidebars.');
