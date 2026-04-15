import sys
import os

path = r'c:\Gaurav\Antigravity\software\AmolGraphics\frontend\app\admin\categories\[id]\edit\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target thickness map
old_thick = 'thicknesses.map(t => <th key={t} className="py-6 px-3 font-black text-[11px] text-slate-600 uppercase tracking-widest text-center">{t}</th>)'
new_thick = """thicknesses.map(t => {
                               const allRowsArr = shapes.flatMap(sh => sh.sizes.map(sz => `${sh.id}_${sz}`));
                               const isAll = allRowsArr.length > 0 && allRowsArr.every(key => (specMapping[key]?.t || []).includes(t));
                               return (
                                 <th key={t} className="py-6 px-3 align-top text-center">
                                    <div className="flex flex-col items-center gap-2">
                                       <span className="font-black text-[11px] text-slate-600 uppercase tracking-widest leading-none mb-1 text-center whitespace-nowrap">{t}</span>
                                       <button 
                                          onClick={() => toggleAllColumn('t', t)}
                                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${isAll ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}
                                       >
                                          {isAll ? 'All On' : 'Set All'}
                                       </button>
                                    </div>
                                 </th>
                               );
                             })"""

content = content.replace(old_thick, new_thick)

# Target mounting map
old_mount = 'mountings.map(m => <th key={m} className="py-6 px-3 font-black text-[11px] text-slate-600 uppercase tracking-widest text-center whitespace-nowrap">{m}</th>)'
new_mount = """mountings.map(m => {
                               const allRowsArr = shapes.flatMap(sh => sh.sizes.map(sz => `${sh.id}_${sz}`));
                               const isAll = allRowsArr.length > 0 && allRowsArr.every(key => (specMapping[key]?.m || []).includes(m));
                               return (
                                 <th key={m} className="py-6 px-3 align-top text-center">
                                    <div className="flex flex-col items-center gap-2 text-center">
                                       <span className="font-black text-[11px] text-slate-600 uppercase tracking-widest whitespace-nowrap leading-none mb-1">{m}</span>
                                       <button 
                                          onClick={() => toggleAllColumn('m', m)}
                                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${isAll ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}
                                       >
                                          {isAll ? 'All On' : 'Set All'}
                                       </button>
                                    </div>
                                 </th>
                               );
                             })"""

content = content.replace(old_mount, new_mount)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
