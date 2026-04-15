"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Layers, Plus, Save, Trash2, ChevronLeft, Loader2, 
  AlertCircle, Package, Info, CheckCircle2, Shapes, 
  Maximize, ChevronRight, ListOrdered, Sparkles, X, 
  Settings2, Copy, ShieldAlert, Image as ImageIcon
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
  thickness: string;
  mounting: string;
  width: number;
  height: number;
  sku: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ type: 'FRONTEND' | 'DATABASE' | 'CONNECTIVITY', message: string } | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // --- Step 1: Basics ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [parentId, setParentId] = useState("");
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [skipLayoutConfig, setSkipLayoutConfig] = useState(false);

  const generatedSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  // --- Step 2: Shapes & States ---
  const [shapes, setShapes] = useState<ShapeConfig[]>([]);
  const [newShapeName, setNewShapeName] = useState("");
  const presetShapes = ["Portrait", "Landscape", "Square", "Circle", "Heart", "Hexagon"];

  // --- Step 3: Specs & Mapping ---
  const [thicknesses, setThicknesses] = useState<string[]>(["2 MM", "3 MM", "5 MM"]);
  const [mountings, setMountings] = useState<string[]>(["Adhesive Tape (Included)", "Desktop Stand"]);
  
  const [newThickness, setNewThickness] = useState("");
  const [newMounting, setNewMounting] = useState("");
  
  const [specMapping, setSpecMapping] = useState<Record<string, { t: string[], m: string[] }>>({});

  const toggleMapping = (key: string, type: 't' | 'm', value: string) => {
    setSpecMapping(prev => {
      const current = prev[key] || { t: [], m: [] };
      const list = current[type];
      const nextList = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
      return { ...prev, [key]: { ...current, [type]: nextList } };
    });
  };

  const toggleAllColumn = (type: 't' | 'm', value: string) => {
    const allRowsArr = shapes.flatMap(sh => sh.sizes.map(sz => `${sh.id}_${sz}`));
    const allSelected = allRowsArr.every(key => (specMapping[key]?.[type] || []).includes(value));

    setSpecMapping(prev => {
      const next = { ...prev };
      allRowsArr.forEach(key => {
        const current = next[key] || { t: [], m: [] };
        if (allSelected) {
           next[key] = { ...current, [type]: (current[type] || []).filter(v => v !== value) };
        } else {
           if (!(current[type] || []).includes(value)) {
              next[key] = { ...current, [type]: [...(current[type] || []), value] };
           }
        }
      });
      return next;
    });
  };

  // --- Task Tracker ---
  const [saveProgress, setSaveProgress] = useState<string | null>(null);

  // --- Initial Data Load ---
  useEffect(() => {
    if (!categoryId || !API_URL) return;
    
    const fetchData = async () => {
      try {
        const [catRes, allCatsRes] = await Promise.all([
          fetch(`${API_URL}/categories/${categoryId}`),
          fetch(`${API_URL}/categories`)
        ]);
        
        const data = await catRes.json();
        const allCats = await allCatsRes.json();
        if (data.error) throw new Error(data.error);

        // 1. Basics
        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
        setImage(data.image || "");
        setParentId(data.parentId || "");
        setTags(data.tags || "");
        setAllCategories((allCats || []).filter((c: any) => c.id !== categoryId));
        setSkipLayoutConfig(data.tags?.includes("skip-layout") || false);

        // 2. Specialized Attributes (Shapes & Sizes)
        const shapeAttr = data.categoryAttributes?.find((a: any) => a.name.toLowerCase() === "shape");
        const sizeAttr = data.categoryAttributes?.find((a: any) => a.name.toLowerCase() === "size");
        const thickAttr = data.categoryAttributes?.find((a: any) => a.name.toLowerCase() === "thickness");
        const mountAttr = data.categoryAttributes?.find((a: any) => a.name.toLowerCase() === "mounting");
        const matrixAttr = data.categoryAttributes?.find((a: any) => a.name.toLowerCase().includes("matrix"));

        if (matrixAttr && matrixAttr.attributeOptions?.[0]) {
           try {
              const savedMatrix = JSON.parse(matrixAttr.attributeOptions[0].value);
              setSpecMapping(savedMatrix);
           } catch (e) {
              console.warn("Failed to parse saved matrix:", e);
           }
        }

        const allSizesInDb = sizeAttr?.attributeOptions.map((o: any) => o.value) || [];

        if (shapeAttr) {
           const mappedShapes = shapeAttr.attributeOptions.map((opt: any) => {
              const shapeName = opt.value.toLowerCase();
                 // SMART GEOMETRIC SORT
                 const filteredSizes = allSizesInDb.filter((s: string) => {
                    const [w, h] = s.split('X').map(Number);
                    if (isNaN(w) || isNaN(h)) return false; 
                    
                    const isPortrait = w < h;
                    const isLandscape = w > h;
                    const isEquilateral = w === h;

                    if (shapeName.includes("portrait")) return isPortrait;
                    if (shapeName.includes("landscape")) return isLandscape;
                    // Circle, Heart, Hexagon, and Square all use Equilateral (Square) sizes
                    if (shapeName.includes("square") || shapeName.includes("circle") || 
                        shapeName.includes("heart") || shapeName.includes("hexagon")) {
                       return isEquilateral;
                    }
                    return true;
                 });

              return {
                 id: opt.id,
                 name: opt.value,
                 image: opt.image || "",
                 sizes: filteredSizes
              };
           });
           if (mappedShapes.length > 0) setShapes(mappedShapes);
        }

        if (thickAttr && thickAttr.attributeOptions?.length > 0) {
           setThicknesses(thickAttr.attributeOptions.map((o: any) => o.value));
        }
        if (mountAttr && mountAttr.attributeOptions?.length > 0) {
           setMountings(mountAttr.attributeOptions.map((o: any) => o.value));
        }

      } catch (err: any) {
        setErrorDetails({ type: 'DATABASE', message: "Initialization Failure: " + err.message });
      } finally { setLoading(false); }
    };

    fetchData();
  }, [categoryId]);

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

  const addShape = (sn?: string) => {
    const sName = sn || newShapeName;
    if (!sName || shapes.find(s => s.name.toLowerCase() === sName.toLowerCase())) return;
    setShapes([...shapes, { id: 'temp-' + Date.now(), name: sName, image: "", sizes: [] }]);
    setNewShapeName("");
  };

  const updateShapeImage = (id: string, url: string) => {
    setShapes(shapes.map(s => s.id === id ? { ...s, image: url } : s));
  };

  const removeShape = (id: string) => setShapes(shapes.filter(s => s.id !== id));

  const updateSizes = (shapeId: string, bulkInput: string) => {
    const parsedSizes = bulkInput.replace(/ /g, '').split(/[,\n]/).map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, sizes: parsedSizes } : s));
  };

  // --- Final Atomic Sync Update ---
  const handleFinalSubmit = async () => {
    if (!name) { setErrorDetails({ type: 'FRONTEND', message: "Identity Name is missing." }); return; }
    setSubmitting(true);
    setErrorDetails(null);
    setSaveProgress("Initiating Category Sync...");

    try {
      // 1. Sync Core Metadata
      setSaveProgress("Updating Identity & Logo...");
      const coreRes = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          slug: slug || name.toLowerCase().replace(/[`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, '').replace(/ /g, '-'), 
          image, 
          description, 
          parentId: parentId || null,
          tags: skipLayoutConfig ? (tags.includes("skip-layout") ? tags : (tags ? tags + ", skip-layout" : "skip-layout")) : tags.replace(", skip-layout", "").replace("skip-layout", "").trim()
        })
      });
      if (!coreRes.ok) {
        const errorData = await coreRes.json();
        throw new Error(errorData.error || "Identity Update Failed");
      }

      // 2. Individual Attribute Synchronization
      const syncAttributeSet = async (attrName: string, type: string, values: string[]) => {
        setSaveProgress(`Synchronizing ${attrName} Definitions...`);
        
        // Always get absolute fresh state
        const catRes = await fetch(`${API_URL}/categories/${categoryId}`);
        const catData = await catRes.json();
        let attr = catData.categoryAttributes?.find((a: any) => a.name === attrName);

        if (!attr) {
           const createRes = await fetch(`${API_URL}/categories/${categoryId}/attributes`, {
             method: "POST", headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ name: attrName, type })
           });
           attr = await createRes.json();
        }

        const existingOptions = attr.attributeOptions || [];
        const uniqueValues = Array.from(new Set(values));

        // Surgical Update (Only delete if not in use or explicitly removed)
        for (const opt of existingOptions) {
           if (!uniqueValues.includes(opt.value)) {
              try {
                await fetch(`${API_URL}/categories/options/${opt.id}`, { method: "DELETE" });
              } catch (e) {
                console.warn(`Soft-skipped deletion for active option: ${opt.value}`);
              }
           }
        }

        // Add/Update
        for (const v of uniqueValues) {
           const exists = existingOptions.find((o: any) => o.value === v);
           if (!exists) {
              const shapeMapping = shapes.find(sh => sh.name === v);
              await fetch(`${API_URL}/categories/attributes/${attr.id}/options`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: v, displayValue: v, price: 0, image: shapeMapping?.image || "" })
              });
           } else {
              const shapeMapping = shapes.find(sh => sh.name === v);
              if (shapeMapping?.image && exists.image !== shapeMapping.image) {
                await fetch(`${API_URL}/categories/options/${exists.id}`, {
                  method: "PATCH", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image: shapeMapping.image })
                });
              }
           }
        }
      };

      await syncAttributeSet("Shape", "BUTTON_GROUP", shapes.map(s => s.name));
      await syncAttributeSet("Size", "SELECT", Array.from(new Set(shapes.flatMap(s => s.sizes))));
      await syncAttributeSet("Thickness", "SELECT", thicknesses);
      await syncAttributeSet("Mounting", "SELECT", mountings);
      await syncAttributeSet("Matrix_Config", "JSON", [JSON.stringify(specMapping)]);

      setSaveProgress("Sync Complete. Finalizing...");
      setSuccess(true);
      setTimeout(() => router.push("/admin/categories"), 2000);
    } catch (err: any) {
      setErrorDetails({ type: 'DATABASE', message: err.message });
      setSaveProgress(null);
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) return (
     <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
     </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Update Successful</h1>
        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>Redirecting to index...</span>
           </div>
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
               <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Category Editor</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of {skipLayoutConfig ? '3' : '4'} • {step === 1 ? 'Basics' : step === 2 ? 'Shapes' : step === 3 ? 'Sizes' : 'Matrix'}</p>
            </div>
          </div>
          <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="px-5 py-2 text-slate-600 font-black text-[12px] uppercase hover:text-slate-900 transition-all active:scale-95">Back</button>
              )}
              
              <button 
                onClick={handleFinalSubmit} 
                disabled={submitting}
                className={`px-8 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 active:scale-95 ${step === 4 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border border-slate-200 text-slate-900 shadow-slate-100 hover:border-blue-600 hover:text-blue-600'}`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="animate-pulse">{saveProgress || 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{step === 4 ? 'Finalize & Save' : 'Commit changes'}</span>
                  </>
                )}
              </button>

              {(step < 4 && !(step === 3 && skipLayoutConfig)) && (
                <button onClick={() => setStep(step + 1)} disabled={step === 1 && !name} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  Continue <ChevronRight size={14} />
                </button>
              )}
              {step === 3 && skipLayoutConfig && (
                <button onClick={handleFinalSubmit} disabled={submitting} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Finalize & Save</span>
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
          <div className="mb-10 p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl text-rose-900 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-rose-500 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="font-black text-[11px] uppercase tracking-widest mb-1">Update Error</h3>
                <p className="text-sm font-bold">{errorDetails.message}</p>
              </div>
              <button onClick={() => setErrorDetails(null)}><X size={16} /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Sparkles size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Category Identity</h2>
                   <p className="text-slate-400 font-medium text-sm">Update the branding and parent hierarchy.</p>
                </div>
             </div>
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Category Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-2xl font-black text-slate-900 outline-none bg-transparent border-b-2 border-slate-100 focus:border-blue-600 transition-all pb-2" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Parent Category</label>
                    <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm">
                       <option value="">None (Top Level)</option>
                       {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Logo</label>
                   {!image ? (
                     <label className="relative group cursor-pointer block">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="w-full h-32 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center gap-4 hover:bg-white hover:border-blue-400 transition-all">
                           {uploading ? <Loader2 size={24} className="text-blue-500 animate-spin" /> : <Package size={24} className="text-slate-400" />}
                           <span className="font-black text-[11px] uppercase tracking-widest">Click to upload image</span>
                        </div>
                     </label>
                   ) : (
                     <div className="relative group w-48 h-32 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg">
                        <img src={image.startsWith('/') ? `${API_URL?.replace('/api','')}${image}` : image} className="w-full h-full object-cover" />
                        <button onClick={() => setImage("")} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                     </div>
                   )}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Meta summary..." className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all" />
                  <div className="flex items-center justify-between">
                    <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Wall Decor, Trending, Acrylic" className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                    <label className="flex items-center gap-3 ml-6 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full transition-all relative ${skipLayoutConfig ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${skipLayoutConfig ? 'left-7' : 'left-1'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={skipLayoutConfig} onChange={e => setSkipLayoutConfig(e.target.checked)} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900">Skip Layout Matrix</span>
                    </label>
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
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Shapes Library</h2>
                   <p className="text-slate-400 font-medium text-sm">Add or remove shapes that define this category's layouts.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetShapes.map(ps => (
                   <button key={ps} onClick={() => addShape(ps)} disabled={shapes.some(s => s.name === ps)} className={`h-16 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest transition-all ${shapes.some(s => s.name === ps) ? 'bg-purple-600 text-white border-purple-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-purple-200'}`}>
                      <span>{ps}</span>
                   </button>
                ))}
             </div>
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                <div className="flex gap-3 mb-8">
                   <input type="text" value={newShapeName} onChange={e => setNewShapeName(e.target.value)} placeholder="Custom shape name..." className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" />
                   <button onClick={() => addShape()} className="px-8 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase">Add</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {shapes.map(s => (
                      <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-purple-200 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] uppercase">{s.name.substring(0,2)}</div>
                               <span className="font-black text-[12px] uppercase tracking-widest text-slate-900">{s.name}</span>
                            </div>
                            <button onClick={() => removeShape(s.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                         </div>
                         
                         <label className="relative group cursor-pointer block h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:bg-white hover:border-purple-300 transition-all">
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (!file) return;
                               const formData = new FormData();
                               formData.append("image", file);
                               const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
                               const data = await res.json();
                               if (data.url) updateShapeImage(s.id, data.url);
                            }} />
                            {s.image ? (
                               <img src={s.image.startsWith('/') ? `${API_URL?.replace('/api','')}${s.image}` : s.image} className="w-full h-full object-contain p-2" />
                            ) : (
                               <div className="h-full flex flex-col items-center justify-center gap-1">
                                  <ImageIcon size={20} className="text-slate-300" />
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Add Viz</span>
                               </div>
                            )}
                         </label>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><ListOrdered size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Size Definitions</h2>
                   <p className="text-slate-400 font-medium text-sm">Update the W x H strings for each shape.</p>
                </div>
             </div>
             <div className="space-y-6">
                {shapes.map(s => (
                   <div key={s.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-8">
                      <div className="w-48 pt-2">
                         <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl inline-flex items-center gap-2 mb-2">
                            <Shapes size={14} /><span className="font-black text-[10px] uppercase tracking-widest">{s.name}</span>
                         </div>
                      </div>
                      <div className="flex-1">
                         <textarea rows={2} placeholder="7x10, 8x12, 12x18..." defaultValue={s.sizes.join(', ')} onBlur={(e) => updateSizes(s.id, e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-base font-black text-slate-700 outline-none focus:bg-white focus:border-orange-500 transition-all resize-none shadow-inner" />
                         <div className="flex items-center justify-between mt-3 px-1">
                            <div className="flex items-center gap-2">
                               <Info size={12} className="text-slate-400" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  {s.name.toLowerCase().includes('portrait') ? 'Requirement: W < H (Rectangle)' : 
                                   s.name.toLowerCase().includes('landscape') ? 'Requirement: W > H (Rectangle)' : 
                                   'Requirement: W = H (Equilateral)'}
                               </span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{s.sizes.length} Definitions</span>
                         </div>
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
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Constraint Matrix</h2>
                   <p className="text-slate-400 font-medium text-sm">Assign available depths and hardware for each size.</p>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-50">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Depth Option</label>
                      <div className="flex gap-2">
                         <input type="text" value={newThickness} onChange={e => setNewThickness(e.target.value)} placeholder="e.g. 8 MM" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none" />
                         <button onClick={() => { if(newThickness && !thicknesses.includes(newThickness)) { setThicknesses([...thicknesses, newThickness]); setNewThickness(""); } }} className="px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus size={14} /></button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Hardware Option</label>
                      <div className="flex gap-2">
                         <input type="text" value={newMounting} onChange={e => setNewMounting(e.target.value)} placeholder="e.g. Desk Stand" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none" />
                         <button onClick={() => { if(newMounting && !mountings.includes(newMounting)) { setMountings([...mountings, newMounting]); setNewMounting(""); } }} className="px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus size={14} /></button>
                      </div>
                   </div>
                </div>

                <div className="overflow-x-auto -mx-8 px-8">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b-2 border-slate-100">
                            <th className="py-6 font-black text-xs text-slate-900 uppercase tracking-widest w-48">Shape & Size</th>
                            {thicknesses.map(t => {
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
                             })}
                            <th className="w-6 border-r border-slate-100" />
                            {mountings.map(m => {
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
                             })}
                         </tr>
                      </thead>
                      <tbody>
                         {shapes.map(sh => sh.sizes.map(sz => {
                            const key = `${sh.id}_${sz}`;
                            const active = specMapping[key] || { t: [], m: [] };
                            return (
                               <tr key={key} className="border-b border-slate-50 group hover:bg-slate-50 transition-colors">
                                  <td className="py-5 flex items-center gap-4">
                                     <div className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 shrink-0">{sh.name}</div>
                                     <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{sz}</span>
                                  </td>
                                  {thicknesses.map(t => (
                                     <td key={t} className="py-5 px-3 text-center">
                                        <button onClick={() => toggleMapping(key, 't', t)} className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center mx-auto shadow-sm active:scale-90 ${active.t.includes(t) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-transparent hover:border-blue-400'}`}><CheckCircle2 size={14} strokeWidth={4} /></button>
                                     </td>
                                  ))}
                                  <td className="w-6 border-r border-slate-100" />
                                  {mountings.map(m => (
                                     <td key={m} className="py-5 px-3 text-center">
                                        <button onClick={() => toggleMapping(key, 'm', m)} className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center mx-auto shadow-sm active:scale-90 ${active.m.includes(m) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-transparent hover:border-blue-400'}`}><CheckCircle2 size={14} strokeWidth={4} /></button>
                                     </td>
                                  ))}
                               </tr>
                            );
                         }))}
                      </tbody>
                   </table>
                </div>

                <div className="pt-10 space-y-4">
                   <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 flex items-start gap-4">
                      <ShieldAlert className="text-red-500 mt-1" size={20} />
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Matrix Modification Warning</h4>
                         <p className="text-[11px] font-medium text-slate-500 tracking-tight leading-relaxed italic">Changes here will OVERWRITE associated specialized attribute choices. Products using deleted combinations may need manual sync.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
