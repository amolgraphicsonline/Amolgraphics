"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Layers, Plus, Save, Trash2, ChevronLeft, Loader2, 
  AlertCircle, Package, Info, CheckCircle2, Shapes, 
  Maximize, ChevronRight, ListOrdered, Sparkles, X, 
  Settings2, Copy
} from "lucide-react";

// --- Types ---
type ShapeConfig = {
  id: string;
  name: string;
  image?: string;
  sizes: string[]; 
};

type Variant = {
  shape: string;
  size: string;
  width: number;
  height: number;
  price: number;
  sku: string;
};

export default function CategoryWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ type: 'FRONTEND' | 'DATABASE' | 'CONNECTIVITY', message: string } | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // --- Step 1: Basics ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const generatedSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) setImage(data.url);
      else setErrorDetails({ type: 'DATABASE', message: data.error || "Upload failed" });
    } catch (err) { setErrorDetails({ type: 'CONNECTIVITY', message: "Image upload failed." }); }
    finally { setUploading(false); }
  };

  // --- Step 2: Shapes ---
  const [shapes, setShapes] = useState<ShapeConfig[]>([]);
  const [newShapeName, setNewShapeName] = useState("");
  const presetShapes = ["Portrait", "Landscape", "Square", "Circle", "Heart", "Hexagon"];

  const addShape = (sn?: string) => {
    const sName = sn || newShapeName;
    if (!sName || shapes.find(s => s.name.toLowerCase() === sName.toLowerCase())) return;
    setShapes([...shapes, { id: Math.random().toString(36).substr(2, 9), name: sName, image: "", sizes: [] }]);
    setNewShapeName("");
  };

  const updateShapeImage = (id: string, url: string) => {
    setShapes(shapes.map(s => s.id === id ? { ...s, image: url } : s));
  };

  const removeShape = (id: string) => setShapes(shapes.filter(s => s.id !== id));

  // --- Step 3: Sizes ---
  const updateSizes = (shapeId: string, bulkInput: string) => {
    const parsedSizes = bulkInput.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
    setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, sizes: parsedSizes } : s));
  };

  // --- Step 4: Specs & Mapping ---
  const [thicknesses, setThicknesses] = useState<string[]>(["2 MM", "3 MM", "5 MM"]);
  const [mountings, setMountings] = useState<string[]>(["Adhesive Tape (Included)", "Desktop Stand"]);
  const [newThickness, setNewThickness] = useState("");
  const [newMounting, setNewMounting] = useState("");

  // mapping[shapeId_sizeValue] = { thicknesses: string[], mountings: string[] }
  const [specMapping, setSpecMapping] = useState<Record<string, { t: string[], m: string[] }>>({});

  // Initialize mapping when shapes/sizes change
  useEffect(() => {
    const newMapping = { ...specMapping };
    let changed = false;
    shapes.forEach(sh => {
      sh.sizes.forEach(sz => {
        const key = `${sh.id}_${sz}`;
        if (!newMapping[key]) {
          newMapping[key] = { t: [thicknesses[0]], m: [mountings[0]] };
          changed = true;
        }
      });
    });
    if (changed) setSpecMapping(newMapping);
  }, [shapes, thicknesses, mountings]);

  const toggleMapping = (key: string, type: 't' | 'm', value: string) => {
    setSpecMapping(prev => {
      const current = prev[key] || { t: [], m: [] };
      const list = current[type];
      const nextList = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
      return { ...prev, [key]: { ...current, [type]: nextList } };
    });
  };

  // --- Step 5: Variants ---
  const [variants, setVariants] = useState<any[]>([]);
  const [basePrice, setBasePrice] = useState("1");

  useEffect(() => {
    if (step === 5) {
      const generated: any[] = [];
      shapes.forEach(sh => {
        sh.sizes.forEach(sz => {
          const key = `${sh.id}_${sz}`;
          const active = specMapping[key] || { t: [], m: [] };
          active.t.forEach(th => {
            active.m.forEach(mt => {
              const dimensions = sz.toLowerCase().split('x');
              const w = parseInt(dimensions[0]) || 0;
              const h = parseInt(dimensions[1]) || 0;
              
              // Normalize dimension string based on shape for SKU and mapping
              let finalSizeStr = sz;
              if (sh.name.toLowerCase().includes('landscape') && w < h) finalSizeStr = `${h}X${w}`;
              else if (sh.name.toLowerCase().includes('portrait') && w > h) finalSizeStr = `${h}X${w}`;

              generated.push({
                shape: sh.name,
                size: finalSizeStr,
                thickness: th,
                mounting: mt,
                width: w,
                height: h,
                price: basePrice || "1",
                sku: `${name.substring(0,3).toUpperCase()}-${sh.name.substring(0,1).toUpperCase()}-${finalSizeStr.replace(/[^0-9]/g,'')}-${th.replace(/[^0-9]/g,'')}MM-${mt.substring(0,2).toUpperCase()}`
              });
            });
          });
        });
      });
      setVariants(generated);
    }
  }, [step, shapes, thicknesses, mountings, specMapping, name, basePrice]);

  const updateVariantPrice = (index: number, price: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, price } : v));
  };

  const handleFinalSubmit = async () => {
    if (!name) { setErrorDetails({ type: 'FRONTEND', message: "Name is required." }); return; }
    setLoading(true);
    setErrorDetails(null);
    try {
      const baseSlug = generatedSlug;
      let catRes;
      try {
        catRes = await fetch(`${API_URL}/categories`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug: baseSlug, description, image: image || "https://placehold.co/400x400?text=No+Image", tags: "Wizard" })
        });
      } catch(e) { throw { type: 'CONNECTIVITY', message: "Connectivity failure." }; }

      const category = await catRes.json();
      if (!catRes.ok) throw { type: 'DATABASE', message: category.error || "Conflict detected." };

      const createAttrWidthOptions = async (attrName: string, type: string, values: string[]) => {
        const res = await fetch(`${API_URL}/categories/${category.id}/attributes`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: attrName, type })
        });
        const attr = await res.json();
        for (const v of Array.from(new Set(values))) {
          const shapeConfig = shapes.find(s => s.name === v);
          await fetch(`${API_URL}/categories/attributes/${attr.id}/options`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: v, displayValue: v, price: 0, image: shapeConfig?.image || "" })
          });
        }
        return attr;
      };

      await createAttrWidthOptions("Shape", "BUTTON_GROUP", shapes.map(s => s.name));
      await createAttrWidthOptions("Size", "SELECT", Array.from(new Set(shapes.flatMap(s => s.sizes))));
      await createAttrWidthOptions("Thickness", "SELECT", thicknesses);
      await createAttrWidthOptions("Mounting", "SELECT", mountings);

      const productPayload = {
        categoryId: category.id,
        name: name,
        slug: `${baseSlug}-product-${Date.now().toString().slice(-4)}`,
        description,
        productType: "VARIABLE",
        status: "PUBLISHED",
        mainImage: image || "https://placehold.co/400x400?text=No+Image",
        sku: `WZ-${name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
        trackInventory: false,
        isReadyToSale: false,
        tags: "Wizard-Generated",
        variants: variants.map(v => ({
          sku: v.sku, price: parseFloat(v.price) || 1, stock: 100, isActive: true,
          attributes: [
            { name: "Shape", value: v.shape }, { name: "Size", value: v.size },
            { name: "Thickness", value: v.thickness }, { name: "Mounting", value: v.mounting }
          ]
        }))
      };

      const prodRes = await fetch(`${API_URL}/products`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload)
      });
      if (!prodRes.ok) throw { type: 'DATABASE', message: "Product matrix failure." };

      setSuccess(true);
      setTimeout(() => router.push("/admin/categories"), 3000);
    } catch (err: any) {
      setErrorDetails(err.type ? err : { type: 'DATABASE', message: err.message });
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Wizard Successful</h1>
        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
          Your product category and variants have been successfully synchronized with the database.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>Returning to dashboard...</span>
           </div>
           <button onClick={() => router.push("/admin/categories")} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">
              Click here to redirect manually
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-slate-500" />
            </button>
            <div>
               <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Product Wizard</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 4 • {step === 1 ? 'Basics' : step === 2 ? 'Shapes' : step === 3 ? 'Sizes' : 'Variants'}</p>
            </div>
          </div>
          <div className="flex gap-3">
             {step > 1 && (
               <button onClick={() => setStep(step - 1)} className="px-5 py-2 text-slate-600 font-black text-[12px] uppercase">Back</button>
             )}
             {step < 4 ? (
               <button onClick={() => setStep(step + 1)} disabled={step === 1 && !name} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                 Continue <ChevronRight size={14} />
               </button>
             ) : (
               <button onClick={handleFinalSubmit} disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-2">
                 {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Finish & Create
               </button>
             )}
          </div>
        </div>
        <div className="h-1 bg-slate-50 mt-4 overflow-hidden">
           <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step/4)*100}%` }} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {errorDetails && (
          <div className={`mb-10 p-6 rounded-3xl border-2 animate-in slide-in-from-top-4 transition-all ${
            errorDetails.type === 'DATABASE' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            errorDetails.type === 'CONNECTIVITY' ? 'bg-slate-50 border-slate-200 text-slate-900' :
            'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${
                errorDetails.type === 'DATABASE' ? 'bg-rose-500 text-white' :
                errorDetails.type === 'CONNECTIVITY' ? 'bg-slate-500 text-white' :
                'bg-amber-500 text-white'
              }`}>
                {errorDetails.type === 'DATABASE' ? <Layers size={20} /> : 
                 errorDetails.type === 'CONNECTIVITY' ? <Info size={20} className="animate-pulse" /> : 
                 <Settings2 size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <h3 className="font-black text-[11px] uppercase tracking-widest leading-none">{errorDetails.type} ERROR</h3>
                   <span className="w-1 h-1 bg-current opacity-30 rounded-full" />
                   <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Diagnostic Report</p>
                </div>
                <p className="text-sm font-bold leading-relaxed">{errorDetails.message}</p>
              </div>
              <button onClick={() => setErrorDetails(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors"><X size={16} /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Sparkles size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Start with the basics</h2>
                   <p className="text-slate-400 font-medium text-sm">Every great product needs a name and identity.</p>
                </div>
             </div>
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Product/Category Name <span className="text-red-500">*</span></label>
                      {name && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in zoom-in">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SLUG:</span>
                           <span className="text-[10px] font-mono font-bold text-blue-600">/{generatedSlug}</span>
                        </div>
                      )}
                   </div>
                   <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acrylic Photo Print" className="w-full text-4xl font-black text-slate-900 placeholder:text-slate-100 outline-none bg-transparent" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description</label>
                   <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a catchy description..." className="w-full text-lg font-medium text-slate-600 placeholder:text-slate-200 outline-none bg-transparent resize-none leading-relaxed" />
                </div>
                <div className="pt-8 border-t border-slate-50 space-y-6">
                   <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Featured Asset</label>
                      {image && (
                        <button onClick={() => setImage("")} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                           <Trash2 size={10} /> Clear Asset
                        </button>
                      )}
                   </div>
                   
                   {!image ? (
                     <label className="relative group cursor-pointer block">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="w-full h-48 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 transition-all group-hover:bg-white group-hover:border-blue-400 group-hover:shadow-xl group-hover:shadow-blue-50">
                           <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                              {uploading ? <Loader2 size={24} className="text-blue-500 animate-spin" /> : <Package size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
                           </div>
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Upload Featured Image</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-[200px]">Drag and drop your file here or click to browse files from your computer</p>
                        </div>
                     </label>
                   ) : (
                     <div className="relative group w-full h-64 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg animate-in zoom-in duration-500">
                        <img 
                           src={image.startsWith('/') ? `${API_URL?.replace('/api','')}${image}` : image} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 right-4 flex gap-2">
                           <label className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-900 cursor-pointer hover:bg-white transition-all shadow-xl active:scale-95">
                              <Plus size={16} />
                              <input type="file" className="hidden" accept="image/*,.webp,.avif" onChange={handleImageUpload} />
                           </label>
                           <button onClick={() => setImage("")} className="p-2 bg-red-500/90 backdrop-blur rounded-xl text-white hover:bg-red-600 transition-all shadow-xl active:scale-95">
                              <X size={16} />
                           </button>
                        </div>
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                           <div className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg">
                              IMAGE RESOLVED
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External Asset Fallback</label>
                      </div>
                      <input 
                         type="text" value={image} onChange={e => setImage(e.target.value)}
                         placeholder="Or paste an image URL directly here..."
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold font-mono outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-500"
                      />
                   </div>
                </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Shapes size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Define Your Shapes</h2>
                   <p className="text-slate-400 font-medium text-sm">Select the geometric orientations available for this product.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetShapes.map(ps => (
                   <button 
                     key={ps} 
                     onClick={() => addShape(ps)} 
                     disabled={shapes.some(s => s.name === ps)} 
                     className={`h-16 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest transition-all ${shapes.some(s => s.name === ps) ? 'bg-purple-600 text-white border-purple-600 shadow-xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-purple-200 active:scale-95'}`}
                   >
                      {ps === 'Portrait' && <Maximize size={18} className="rotate-90" />}
                      {ps === 'Landscape' && <Maximize size={18} />}
                      {ps === 'Square' && <Settings2 size={18} />}
                      <span>{ps}</span>
                   </button>
                ))}
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Configured Geometries ({shapes.length})</h3>
                   <div className="flex gap-2">
                      <input 
                        type="text" value={newShapeName} onChange={e => setNewShapeName(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && addShape()} 
                        placeholder="Add custom shape..." 
                        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:bg-white focus:border-purple-500" 
                      />
                      <button onClick={() => addShape()} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Add</button>
                   </div>
                </div>

                {shapes.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                     <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4"><Plus size={32} /></div>
                     <p className="text-slate-400 font-bold text-sm">No shapes selected yet.</p>
                     <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Select a preset above to begin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shapes.map(s => (
                       <div key={s.id} className="group bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[9px] uppercase shadow-lg shadow-slate-200">{s.name.substring(0,2)}</div>
                                <span className="font-black text-[12px] uppercase tracking-widest text-slate-900">{s.name}</span>
                             </div>
                             <button onClick={() => removeShape(s.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><X size={16} /></button>
                          </div>
                          
                          <label className={`relative group cursor-pointer block h-32 rounded-2xl overflow-hidden transition-all ${s.image ? 'bg-white border border-slate-100' : 'bg-slate-50 border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-white'}`}>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append("image", file);
                                setUploading(true);
                                try {
                                  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
                                  const data = await res.json();
                                  if (data.url) updateShapeImage(s.id, data.url);
                                } catch (e) {
                                  console.error("Upload failed", e);
                                } finally {
                                  setUploading(false);
                                }
                             }} />
                             {s.image ? (
                                <div className="relative w-full h-full p-2">
                                  <img src={s.image.startsWith('/') ? `${API_URL?.replace('/api','')}${s.image}` : s.image} className="w-full h-full object-contain" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">Change Mockup</span>
                                  </div>
                                </div>
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-2">
                                   <div className="p-2 bg-white rounded-xl shadow-sm text-slate-300 group-hover:text-purple-500 transition-colors"><Maximize size={20} /></div>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Vizualizer</span>
                                </div>
                             )}
                          </label>
                       </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><ListOrdered size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Enter Available Sizes</h2>
                   <p className="text-slate-400 font-medium text-sm">For each shape, enter the sizes available (width x height).</p>
                </div>
             </div>
             <div className="space-y-6">
                {shapes.map(s => (
                   <div key={s.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-8">
                      <div className="w-48 pt-2">
                         <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl inline-flex items-center gap-2 mb-2">
                            <Shapes size={14} /><span className="font-black text-[10px] uppercase tracking-widest">{s.name}</span>
                         </div>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-relaxed">Enter sizes for this shape.</p>
                      </div>
                      <div className="flex-1">
                         <textarea rows={2} placeholder="7x10, 8x12, 9x13..." defaultValue={s.sizes.join(', ')} onBlur={(e) => updateSizes(s.id, e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-base font-black text-slate-700 outline-none focus:bg-white focus:border-orange-500 transition-all resize-none shadow-inner" />
                         <div className="flex flex-wrap gap-2 mt-4">
                            {s.sizes.map((sz, idx) => (
                               <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black border border-orange-100 uppercase">{sz}</span>
                            ))}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Settings2 size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Assignment Matrix</h2>
                   <p className="text-slate-400 font-medium text-sm">Link specific thickness & mounting to each size.</p>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-50">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Depth Option</label>
                      <div className="flex gap-2">
                         <input type="text" value={newThickness} onChange={e => setNewThickness(e.target.value)} placeholder="e.g. 8 MM" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:border-indigo-500" />
                         <button onClick={() => { if(newThickness && !thicknesses.includes(newThickness)) { setThicknesses([...thicknesses, newThickness]); setNewThickness(""); } }} className="px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus size={14} /></button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Hardware Option</label>
                      <div className="flex gap-2">
                         <input type="text" value={newMounting} onChange={e => setNewMounting(e.target.value)} placeholder="e.g. Acrylic Stand" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:border-indigo-500" />
                         <button onClick={() => { if(newMounting && !mountings.includes(newMounting)) { setMountings([...mountings, newMounting]); setNewMounting(""); } }} className="px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus size={14} /></button>
                      </div>
                   </div>
                </div>

                <div className="overflow-x-auto -mx-8 px-8">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-slate-100">
                            <th className="py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest w-40">Shape & Size</th>
                            {thicknesses.map(t => (
                               <th key={t} className="py-4 px-2 font-black text-[9px] text-slate-400 uppercase tracking-widest text-center">{t}</th>
                            ))}
                            <th className="w-8 border-r border-slate-50" />
                            {mountings.map(m => (
                               <th key={m} className="py-4 px-2 font-black text-[9px] text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">{m.split(' ')[0]}...</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody>
                         {shapes.map(sh => sh.sizes.map(sz => {
                            const key = `${sh.id}_${sz}`;
                            const active = specMapping[key] || { t: [], m: [] };
                            return (
                               <tr key={key} className="border-b border-slate-50 group hover:bg-slate-50/50">
                                  <td className="py-4 flex items-center gap-3">
                                     <div className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[8px] font-black uppercase tracking-tighter shrink-0">{sh.name.substring(0,2)}</div>
                                     <span className="text-xs font-black text-slate-700 uppercase">{sz}</span>
                                  </td>
                                  {thicknesses.map(t => (
                                     <td key={t} className="py-4 px-2 text-center">
                                        <button 
                                           onClick={() => toggleMapping(key, 't', t)}
                                           className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center mx-auto
                                                      ${active.t.includes(t) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent hover:border-indigo-300'}`}
                                        >
                                           <CheckCircle2 size={12} strokeWidth={4} />
                                        </button>
                                     </td>
                                  ))}
                                  <td className="w-8 border-r border-slate-50" />
                                  {mountings.map(m => (
                                     <td key={m} className="py-4 px-2 text-center">
                                        <button 
                                           onClick={() => toggleMapping(key, 'm', m)}
                                           className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center mx-auto
                                                      ${active.m.includes(m) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent hover:border-indigo-300'}`}
                                        >
                                           <CheckCircle2 size={12} strokeWidth={4} />
                                        </button>
                                     </td>
                                  ))}
                               </tr>
                            );
                         }))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Review Variant Matrix</h2>
                    <p className="text-slate-400 font-medium text-sm">Validating {variants.length} generated combinations.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                   <label className="text-[10px] font-black uppercase text-slate-400">Bulk Price (₹)</label>
                   <input 
                      type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)}
                      className="w-24 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-blue-600 text-sm outline-none"
                   />
                </div>
             </div>
             <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">Shape</th>
                         <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">Size</th>
                         <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">Specs</th>
                         <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest">Price (₹)</th>
                         <th className="px-6 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right">SKU</th>
                      </tr>
                   </thead>
                   <tbody>
                      {variants.slice(0, 50).map((v, i) => (
                         <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-black text-[11px] text-slate-900 uppercase tracking-widest">{v.shape}</td>
                            <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-black text-[10px] uppercase">{v.size}</span></td>
                            <td className="px-6 py-4">
                               <div className="flex gap-2">
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase">{v.thickness}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">{v.mounting?.split(' ')[0]}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <input 
                                 type="number" value={v.price} onChange={e => updateVariantPrice(i, e.target.value)}
                                 className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-blue-600 outline-none focus:bg-white focus:border-blue-500"
                               />
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className="font-mono text-[9px] font-bold text-slate-400">{v.sku}</span>
                            </td>
                         </tr>
                      ))}
                      {variants.length > 50 && (
                        <tr>
                           <td colSpan={5} className="px-6 py-4 text-center bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             ... and {variants.length - 50} more variations
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
             <div className="bg-blue-600 rounded-3xl p-8 text-white flex items-center justify-between shadow-2xl shadow-blue-200">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><Sparkles size={28} /></div>
                   <div>
                      <h3 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Hardware Association Manifest</h3>
                      <p className="text-blue-100 text-sm font-medium leading-tight">Linked {variants.length} combinations across the size matrix.</p>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-3xl font-black">{variants.length}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Final Variant Build</span>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
