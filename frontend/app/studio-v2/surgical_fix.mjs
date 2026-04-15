import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. LEFT SIDE SLOT REPLACEMENT
const leftOld = `) : uploadedPhotos[currentSpreadIndex * 2 - 1] ? (
                                    <Slot 
                                      idx={currentSpreadIndex * 2 - 1}
                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx(currentSpreadIndex * 2 - 1); }}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />
                                  ) : <ImageIcon size={32} className="text-slate-100" />`;

const leftNew = `) : uploadedPhotos[(currentSpreadIndex - 1) * 2] ? (
                                    <Slot 
                                      idx={(currentSpreadIndex - 1) * 2}
                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx((currentSpreadIndex - 1) * 2); }}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />
                                  ) : <ImageIcon size={32} className="text-slate-100" />`;

if (content.includes(leftOld)) {
    content = content.replace(leftOld, leftNew);
    console.log('Fixed Left Side');
}

// 2. RIGHT SIDE SLOT REPLACEMENT
const rightOld = `uploadedPhotos[currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2] ? (
                                    <Slot 
                                      idx={currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2}
                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx(currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2); }}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />
                                  ) : (`;

const rightNew = `currentSpreadIndex === 0 ? (
                                    <div className="w-full h-full relative group/design overflow-hidden">
                                       {selectedDesign?.previewImage && (
                                         <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/design:scale-105" alt="Design Preview" />
                                       )}
                                       <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 border-t border-slate-100/50">
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] block">Cover Design</span>
                                            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest block">{selectedDesign?.name || "Premium Design"}</span>
                                          </div>
                                       </div>
                                    </div>
                                  ) : uploadedPhotos[(currentSpreadIndex - 1) * 2 + 1] ? (
                                    <Slot 
                                      idx={(currentSpreadIndex - 1) * 2 + 1}
                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx((currentSpreadIndex - 1) * 2 + 1); }}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />
                                  ) : (`;

if (content.includes(rightOld)) {
    content = content.replace(rightOld, rightNew);
    console.log('Fixed Right Side Slot/Design');
}

// 3. FOOTER THUMBNAILS
// We find it by searching for a uniquely identifiable part
const footerPart = `resolveMedia(idx === 0 ? null : uploadedPhotos[(idx - 1) * 2 + 1].url, API_URL)`;
if (content.includes(footerPart)) {
    content = content.replace(footerPart, `resolveMedia(idx === 0 ? selectedDesign?.previewImage : uploadedPhotos[(idx - 1) * 2 + 1]?.url, API_URL)`);
    console.log('Fixed Footer Src');
}

const footerCond = `(idx === 0 ? (selectedDesign ? "designPreview" : null) : uploadedPhotos[(idx - 1) * 2 + 1])`;
if (content.includes(footerCond)) {
    content = content.replace(footerCond, `(idx === 0 ? selectedDesign : uploadedPhotos[(idx - 1) * 2 + 1])`);
    console.log('Fixed Footer Condition');
}

// 4. MANUAL HANDLER
content = content.replace(`handlePhotoUpload(currentSpreadIndex === 0 ? 0 : currentSpreadIndex * 2, e.target.files[0]);`,
                        `handlePhotoUpload((currentSpreadIndex - 1) * 2 + 1, e.target.files[0]);`);

fs.writeFileSync(filePath, content);
console.log('Completed successfully');
