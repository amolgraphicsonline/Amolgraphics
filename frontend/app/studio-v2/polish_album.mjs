import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. REMOVE BLUR AND OVERLAY FROM FRONT COVER
const overlayOld = /<div className="absolute inset-0 bg-black\/10 backdrop-blur-\[1px\] flex flex-col items-center justify-center text-center p-4">/;
const overlayNew = '<div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 border-t border-slate-100/50">';

content = content.replace(overlayOld, overlayNew);

const spanOld = /<span className="text-\[10px\] font-black text-white uppercase tracking-\[0.3em\] drop-shadow-md block">Cover Design<\/span>/;
const spanNew = '<span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] block">Cover Design</span>';
content = content.replace(spanOld, spanNew);

const nameOld = /<span className="text-\[8px\] font-bold text-white\/90 uppercase tracking-widest block">{selectedDesign\?\.name || 'Premium Design'}<\/span>/;
const nameNew = '<span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">{selectedDesign?.name || "Premium Design"}</span>';
content = content.replace(nameOld, nameNew);

// 2. FIX FOOTER IMAGE SOURCE
const footerOld = /<img src={resolveMedia\(idx === 0 \? null : uploadedPhotos\[\(idx - 1\) \* 2 \+ 1\]\.url, API_URL\)}/;
const footerNew = '<img src={resolveMedia(idx === 0 ? selectedDesign?.previewImage : uploadedPhotos[(idx - 1) * 2 + 1]?.url, API_URL)}';

content = content.replace(footerOld, footerNew);

fs.writeFileSync(filePath, content);
console.log('Successfully polished cover design and fixed footer thumbnails');
