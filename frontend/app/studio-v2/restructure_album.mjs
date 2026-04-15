import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. UPDATE SPREAD 0 RIGHT SIDE (FRONT COVER) TO SHOW DESIGN
// Find the Right Side spread block and replace the Slot logic for currentSpreadIndex === 0
const frontCoverOld = /uploadedPhotos\[currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2\] \? \([\s\S]*?<Slot[\s\S]*?idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}[\s\S]*?\/>\s*\) : \(/;

const frontCoverDesign = `currentSpreadIndex === 0 ? (
                                    <div className="w-full h-full relative group/design overflow-hidden">
                                       {selectedDesign?.previewImage && (
                                         <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/design:scale-105" alt="Design Preview" />
                                       )}
                                       <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md block">Cover Design</span>
                                            <span className="text-[8px] font-bold text-white/90 uppercase tracking-widest block">{selectedDesign?.name || 'Premium Design'}</span>
                                          </div>
                                       </div>
                                    </div>
                                  ) : uploadedPhotos[currentSpreadIndex === 0 ? 0 : (currentSpreadIndex - 1) * 2 + 1] ? (
                                    <Slot 
                                      idx={(currentSpreadIndex - 1) * 2 + 1}
                                      photos={uploadedPhotos}
                                      isFinal={!isEditMode}
                                      onDoubleClick={() => { setIsEditMode(true); setFocusedSlotIdx((currentSpreadIndex - 1) * 2 + 1); }}
                                      apiUrl={API_URL}
                                      onUpload={handlePhotoUpload}
                                      onAdjust={(idx, photo) => setUploadedPhotos(prev => ({ ...prev, [idx]: photo }))}
                                    />
                                  ) : (`;

content = content.replace(frontCoverOld, frontCoverDesign);

// 2. UPDATE LEFT SIDE INDEX FOR INTERIOR PAGES (SPREAD > 0)
// idx={(currentSpreadIndex - 1) * 2}
content = content.replace(/idx={currentSpreadIndex \* 2 - 1}/g, 'idx={(currentSpreadIndex - 1) * 2}');
// Update condition as well
content = content.replace(/uploadedPhotos\[currentSpreadIndex \* 2 - 1\]/g, 'uploadedPhotos[(currentSpreadIndex - 1) * 2]');

// 3. UPDATE RIGHT SIDE INDEX FOR INTERIOR PAGES (SPREAD > 0)
// idx={(currentSpreadIndex - 1) * 2 + 1}
// Note: Spread 0 Right is now Design, so this only affects idx > 0.
content = content.replace(/idx={currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2}/g, 'idx={(currentSpreadIndex - 1) * 2 + 1}');
// Update condition as well
content = content.replace(/uploadedPhotos\[currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2\]/g, 'uploadedPhotos[currentSpreadIndex === 0 ? "design" : (currentSpreadIndex - 1) * 2 + 1]');
// (Using "design" string as placeholder if needed, but the ternary in frontCoverDesign handles Spread 0)

// 4. FIX MANUAL UPLOAD HANDLERS
content = content.replace(/handlePhotoUpload\(currentSpreadIndex === 0 \? 0 : currentSpreadIndex \* 2/g, 'handlePhotoUpload((currentSpreadIndex - 1) * 2 + 1');

// 5. FIX FOOTER THUMBNAILS MAPPING
// Thumbnails should also reflect that Spread 0 Right is Design.
// Left Side Thumbnail
content = content.replace(/uploadedPhotos\[idx \* 2 - 1\]/g, 'uploadedPhotos[(idx - 1) * 2]');
// Right Side Thumbnail
content = content.replace(/uploadedPhotos\[idx === 0 \? 0 : idx \* 2\]/g, 'idx === 0 ? null : uploadedPhotos[(idx - 1) * 2 + 1]');

// Final cleanup: for idx=0, Right Side Thumbnail should show design preview if available
const footerRightThumb = 'idx === 0 ? null : uploadedPhotos[(idx - 1) * 2 + 1]';
const footerRightThumbFix = '(idx === 0 ? (selectedDesign ? "designPreview" : null) : uploadedPhotos[(idx - 1) * 2 + 1])';
content = content.replace(footerRightThumb, footerRightThumbFix);

// Add img tag for design in thumbnail
const footerImgRegex = /\{idx === 0 \? \(selectedDesign \? "designPreview" : null\) : uploadedPhotos\[\(idx - 1\) \* 2 \+ 1\] && <img src={resolveMedia\(uploadedPhotos\[\(idx - 1\) \* 2 \+ 1\]\.url, API_URL\)} className="w-full h-full object-cover" \/>}/;

const footerDesignImg = `{idx === 0 ? (selectedDesign && <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="w-full h-full object-cover" />) : (uploadedPhotos[(idx - 1) * 2 + 1] && <img src={resolveMedia(uploadedPhotos[(idx - 1) * 2 + 1].url, API_URL)} className="w-full h-full object-cover" />)}`;

content = content.replace(footerImgRegex, footerDesignImg);

fs.writeFileSync(filePath, content);
console.log('Successfully moved Uploaded Photos to Interior Pages and set Design to Front Cover');
