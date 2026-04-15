import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ADD REAL BOOK DESIGN (Depth, Texture, and Page Edges)
// I'll update the main spread container at line 1583
const spreadContainerOld = '<div className="w-full h-full bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.15)] rounded-sm flex relative border border-slate-200/60 overflow-hidden group/spread hover:shadow-[0_60px_150px_-30px_rgba(0,0,0,0.2)] transition-all duration-700">';
const spreadContainerNew = `<div className="w-full h-full bg-[#fafafa] shadow-[0_50px_150px_-30px_rgba(0,0,0,0.3)] rounded-sm flex relative border border-slate-200/60 overflow-hidden group/spread hover:shadow-[0_80px_200px_-30px_rgba(0,0,0,0.4)] transition-all duration-700">
                                {/* Page Thickness Effect (Stacked Pages) */}
                                <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-slate-200/50 via-slate-100/30 to-transparent z-[15]" />
                                <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-slate-200/50 via-slate-100/30 to-transparent z-[15]" />
                                
                                {/* Paper Texture Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[16] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

                                {/* Realistic Spine Gutter */}
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/[0.12] to-transparent z-[20] pointer-events-none" />
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/5 z-[21]" />`;
content = content.replace(spreadContainerOld, spreadContainerNew);

// Remove the old less realistic spine
content = content.replace('<div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/[0.03] via-black/[0.1] to-black/[0.03] z-10" />', '');

// 2. POLISH BRANDING (Flexible Logo & Serif Address)
content = content.replace('<div className="w-24 h-24 relative flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-110">', '<div className="w-full max-w-[280px] h-32 relative flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-105">');

// Update address font to Serif Professional
content = content.replace('text-lg font-black text-[#1877F2] uppercase tracking-normal max-w-[320px] leading-relaxed drop-shadow-sm', 'text-xl font-medium font-serif italic text-[#1877F2] tracking-tight max-w-[400px] leading-relaxed drop-shadow-sm');

fs.writeFileSync(filePath, content);
console.log('Successfully implemented Real Book design and polished professional branding.');
