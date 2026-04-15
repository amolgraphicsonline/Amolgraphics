import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldBlockStart = 'currentSpreadIndex === 0 ? (';
const oldBlockEnd = ') : uploadedPhotos[(currentSpreadIndex - 1) * 2] ? (';

// I need to find the one inside "Left Side" spread
const leftSideSpreadStart = '{/* Left Side */}';

let leftSidePart = content.substring(content.indexOf(leftSideSpreadStart));
let relativeStartIndex = leftSidePart.indexOf(oldBlockStart);
let relativeEndIndex = leftSidePart.indexOf(oldBlockEnd);

if (relativeStartIndex !== -1 && relativeEndIndex !== -1) {
    const newBackCover = `currentSpreadIndex === 0 ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 select-none space-y-12">
                                      {/* Large Brand Logo */}
                                      <div className="flex flex-col items-center gap-8 group/logo">
                                        <div className="w-40 h-40 relative flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-110">
                                          {globalSettings?.logo ? (
                                            <img src={resolveMedia(globalSettings.logo, API_URL)} className="w-full h-full object-contain drop-shadow-2xl" alt="Brand Logo" />
                                          ) : (
                                            <div className="w-full h-full bg-[#1877F2] rounded-3xl flex items-center justify-center text-white font-black text-6xl italic shadow-2xl">A</div>
                                          )}
                                        </div>
                                        
                                        {/* Brand Name */}
                                        <div className="text-center">
                                          <div className="text-4xl font-black italic tracking-tighter text-slate-900 drop-shadow-sm">
                                            Amol <span className="text-[#1877F2]">Graphics</span>
                                          </div>
                                          <span className="text-[14px] font-black text-[#1877F2]/40 uppercase tracking-[0.6em] mt-3 block">Boutique Printing Studio</span>
                                        </div>
                                      </div>

                                      {/* Bold Blue Address */}
                                      <div className="flex flex-col items-center text-center gap-8">
                                        <div className="w-20 h-1.5 bg-[#1877F2] rounded-full shadow-sm" />
                                        <p className="text-2xl font-black text-[#1877F2] uppercase tracking-normal max-w-[500px] leading-[1.4] drop-shadow-sm">
                                          {globalSettings?.contactAddress || globalSettings?.address || 'Shop No. 01, Heramb Apartment, 501/2, Opp. DSK Chintamani, Pate-Sampada, Shaniwar Peth, Pune, Maharashtra 411030'}
                                        </p>
                                        <div className="flex items-center gap-8 mt-6">
                                           <span className="text-[12px] font-extrabold text-slate-300 uppercase tracking-widest">Premium Quality</span>
                                           <div className="w-2 h-2 bg-[#1877F2]/20 rounded-full" />
                                           <span className="text-[12px] font-extrabold text-slate-300 uppercase tracking-widest">Est. 1995</span>
                                        </div>
                                      </div>
                                    </div>
                                  )`;
                                  
    const finalLeftSidePart = leftSidePart.substring(0, relativeStartIndex) + newBackCover + leftSidePart.substring(relativeEndIndex);
    const finalContent = content.substring(0, content.indexOf(leftSideSpreadStart)) + finalLeftSidePart;
    
    fs.writeFileSync(filePath, finalContent);
    console.log('Successfully applied final Back Cover polish');
} else {
    console.log('Could not find legacy back cover block');
}
