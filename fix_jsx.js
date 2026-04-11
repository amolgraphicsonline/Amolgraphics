const fs = require('fs');
const path = 'c:/Gaurav/Antigravity/software/AmolGraphics/frontend/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                           <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">VISIT</span>
                        </div>
                     </div>
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{cat.name}</span>
                  </Link>
                  );
                })}
                
                <Link href="/shop" className="flex flex-col items-center gap-4 group">
                   <div className="w-full aspect-square rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                      <Layout className="w-8 h-8 text-slate-300 group-hover:text-blue-600" />
                   </div>
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">VIEW ALL</span>
                </Link>`;

const replacement = `                           <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">SELECT</span>
                        </div>
                     </div>
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors uppercase">{cat.name}</span>
                  </button>
                ))}
                
                <button 
                  onClick={() => {
                    setSelectedShopCat(null);
                    document.getElementById('ready-to-sale')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex flex-col items-center gap-4 group"
                >
                   <div className="w-full aspect-square rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                      <Layout className="w-8 h-8 text-slate-300 group-hover:text-blue-600" />
                   </div>
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">VIEW ALL</span>
                </button>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Replaced successfully");
} else {
    console.log("Target not found exactly");
    // Show a slice of content to debug
    const idx = content.indexOf('VISIT');
    if (idx !== -1) {
       console.log("Snippet at VISIT:", JSON.stringify(content.substring(idx - 100, idx + 200)));
    }
}
