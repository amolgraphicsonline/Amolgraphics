const fs = require('fs');
const path = 'c:/Gaurav/Antigravity/software/AmolGraphics/frontend/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Regex to find from the VISIT span through the closing of the map and the next Link
const regex = /<span className="text-\[9px\] font-black text-slate-900 uppercase tracking-widest">VISIT<\/span>[\s\S]+?<\/Link>[\s\S]+?<\/Link>/;

const replacement = `<span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">SELECT</span>
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

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Replaced successfully with regex");
} else {
    console.log("Regex did not match");
    const snippet = content.slice(content.indexOf('VISIT') - 100, content.indexOf('VISIT') + 500);
    console.log("Context:", JSON.stringify(snippet));
}
