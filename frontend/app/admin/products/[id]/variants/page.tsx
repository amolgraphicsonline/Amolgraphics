"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Plus, Save, Trash2, Package, ChevronLeft, Loader2, 
  AlertCircle, Image as ImageIcon, Settings, ShoppingBag, 
  Grid3X3, Layers, Info, Link as LinkIcon, ChevronDown, ChevronUp, Trash, 
  IndianRupee, Tag, ShieldCheck, Box, Edit3, Zap
} from "lucide-react";

type TabType = "general" | "stock" | "blueprint" | "matrix";

export default function ProductManagementConsole() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("matrix");
  
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  
  // Data State
  const [prodForm, setProdForm] = useState({ name: "", description: "", categoryId: "", trackInventory: false });
  const [newVForm, setNewVForm] = useState({ price: "", sku: "", stock: "0", isDefault: false });
  const [selectedAttr, setSelectedAttr] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<any>(null); // State for editing expanded variant

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id || !API_URL) return;
    
    fetch(`${API_URL}/categories`).then(r => r.json()).then(setCategories).catch(console.error);

    fetch(`${API_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProduct(data);
        setVariants(data.variants || []);
        setProdForm({
          name: data.name,
          description: data.description || "",
          categoryId: data.categoryId || "",
          trackInventory: data.trackInventory || false
        });
        
        const initialAttr: Record<string, string> = {};
        data.category?.categoryAttributes?.forEach((attr: any) => {
          initialAttr[attr.name] = "";
        });
        setSelectedAttr(initialAttr);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, API_URL]);

  const handleUpdateBase = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prodForm)
      });
      if (res.ok) alert("Product updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const attributesPayload = Object.entries(selectedAttr).map(([name, val]) => ({
      attributeName: name,
      attributeValue: val
    }));

    try {
      const res = await fetch(`${API_URL}/products/${id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVForm, attributes: attributesPayload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVariants([...variants, data]);
      setNewVForm({ price: "", sku: "", stock: "0", isDefault: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteV = async (vid: string) => {
    if (!confirm("Remove this variation?")) return;
    try {
      await fetch(`${API_URL}/products/variants/${vid}`, { method: "DELETE" });
      setVariants(variants.filter(v => v.id !== vid));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateVariant = async (vid: string) => {
    if (!editForm || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/products/variants/${vid}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVariants(variants.map(v => v.id === vid ? data : v));
      setExpandedVariant(null);
      setEditForm(null);
      alert("Variation updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
       <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Product Data...</p>
    </div>
  );

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-8">
           <button onClick={() => router.push("/admin/products")} className="p-3.5 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all">
             <ChevronLeft className="w-6 h-6 text-slate-400" />
           </button>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-black text-slate-950 tracking-tight">{product?.name}</h1>
                 <span className="px-4 py-1.5 bg-orange-50 border border-orange-100 text-[10px] font-black text-orange-600 rounded-full uppercase tracking-widest">
                   {product?.category?.name}
                 </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage Prices & Stock</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button 
            type="button" onClick={() => router.push("/admin/products")}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-all"
           >
             Close
           </button>
           <button 
             onClick={handleUpdateBase} disabled={submitting}
             className="px-10 py-4 bg-[#0a0b10] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
           >
             {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-orange-400" />}
             <span>Save Updates</span>
           </button>
        </div>
      </div>

      {/* Product Console */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex min-h-[700px]">
        
        {/* Sidebar */}
        <aside className="w-80 bg-slate-50/50 border-r border-slate-100 p-10 space-y-4">
           <div className="flex items-center gap-4 px-4 mb-10">
              <Box className="w-5 h-5 text-orange-600" />
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Product Menu</span>
           </div>
           
           <ModuleBtn active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Settings className="w-4 h-4" />} label="Basic Details" />
           <ModuleBtn active={activeTab === "matrix"} onClick={() => setActiveTab("matrix")} icon={<Grid3X3 className="w-4 h-4" />} label="Styles & Prices" />
           <ModuleBtn active={activeTab === "stock"} onClick={() => setActiveTab("stock")} icon={<Package className="w-4 h-4" />} label="Inventory" />
           <ModuleBtn active={activeTab === "blueprint"} onClick={() => setActiveTab("blueprint")} icon={<Layers className="w-4 h-4" />} label="Category Info" />
           
           <div className="mt-24 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4 text-green-500" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: Live</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Variations</p>
                      <p className="text-3xl font-black text-slate-950">{variants.length}</p>
                   </div>
                   <div className="p-3 bg-orange-50 rounded-xl">
                      <Zap className="w-5 h-5 text-orange-500" />
                   </div>
                </div>
           </div>
        </aside>

        {/* Interface Panel */}
        <main className="flex-1 p-16 overflow-y-auto bg-white">
           
           {activeTab === "matrix" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-700">
                 <div className="flex justify-between items-end border-b border-slate-50 pb-8">
                    <div>
                       <h3 className="text-3xl font-black text-slate-950 tracking-tight">Product Variations</h3>
                       <p className="text-sm font-bold text-slate-400 mt-2 italic">Add different sizes, colors, or materials for this product.</p>
                    </div>
                 </div>

                 {/* New Variation Block */}
                 <div className="bg-orange-50/30 border border-orange-100/50 rounded-[2.5rem] p-10 shadow-inner">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-8 px-2">Add New Variation</p>
                    <form onSubmit={handleAddVariant} className="grid grid-cols-5 gap-8 items-end">
                       {product.category?.categoryAttributes?.map((attr: any) => (
                          <div key={attr.id} className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{attr.name}</label>
                             <select 
                               required value={selectedAttr[attr.name] || ""}
                               onChange={e => setSelectedAttr({...selectedAttr, [attr.name]: e.target.value})}
                               className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl text-xs font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                             >
                               <option value="">Choose...</option>
                                {attr.attributeOptions?.map((opt: any) => {
                                  const isColor = attr.type === 'SWATCH' && opt.displayValue?.startsWith('#');
                                  return (
                                    <option key={opt.id} value={opt.value}>
                                      {opt.value} {isColor ? `(${opt.displayValue})` : ''}
                                    </option>
                                  );
                                })}
                             </select>
                          </div>
                       ))}
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (₹)</label>
                          <input 
                            placeholder="₹ 0.00" value={newVForm.price}
                            onChange={e => setNewVForm({...newVForm, price: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-orange-100 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                          />
                       </div>
                       <button className="px-8 py-4 bg-[#0a0b10] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-orange-600 transition-all shadow-xl active:scale-95">
                          Add Variation
                       </button>
                    </form>
                 </div>

                 {/* Variations Grid */}
                 <div className="space-y-5">
                    {variants.map((v, i) => (
                       <div key={v.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden hover:border-orange-200 transition-all group">
                          <div className="px-10 py-8 flex items-center justify-between cursor-pointer" onClick={() => {
                            if (expandedVariant === v.id) {
                              setExpandedVariant(null);
                              setEditForm(null);
                            } else {
                              setExpandedVariant(v.id);
                              setEditForm({ 
                                sku: v.sku, 
                                stock: v.stock, 
                                price: v.price, 
                                isDefault: v.isDefault 
                              });
                            }
                          }}>
                             <div className="flex items-center gap-12">
                                <span className="text-[10px] font-black text-slate-200 tracking-tighter w-10 italic">#{i+1}</span>
                                <div className="flex gap-4">
                                   {v.attributes?.map((a: any, idx: number) => {
                                      const attrMeta = product.category?.categoryAttributes?.find((ca: any) => ca.name === a.attributeName);
                                      const optionMeta = attrMeta?.attributeOptions?.find((ao: any) => ao.value === a.attributeValue);
                                      const isSwatch = attrMeta?.type === 'SWATCH';
                                      const hasColor = optionMeta?.displayValue?.startsWith('#');

                                      return (
                                         <div key={idx} className="flex flex-col min-w-[100px]">
                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{a.attributeName}</span>
                                           <div className="flex items-center gap-2 mt-1">
                                              {isSwatch && hasColor && (
                                                <div 
                                                  className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" 
                                                  style={{ backgroundColor: optionMeta.displayValue }}
                                                />
                                              )}
                                              {isSwatch && optionMeta?.image && (
                                                <img 
                                                  src={optionMeta.image.startsWith('http') ? optionMeta.image : `${API_URL?.replace('/api', '')}${optionMeta.image}`} 
                                                  className="w-5 h-5 rounded-lg object-cover border border-slate-200"
                                                />
                                              )}
                                              <span className="text-[13px] font-black text-slate-950">{a.attributeValue}</span>
                                           </div>
                                         </div>
                                      );
                                   })}
                                </div>
                                <div className="flex flex-col min-w-[100px]">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Stock</span>
                                   <span className={`text-[13px] font-black ${v.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{v.stock} Units</span>
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black text-orange-400 uppercase tracking-wider">Price</span>
                                   <span className="text-lg font-black text-slate-950 tracking-tight">₹{v.price}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-10">
                                <button className="p-3 text-slate-200 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100"><Edit3 className="w-5 h-5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteV(v.id); }} className="p-3 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash className="w-5 h-5" /></button>
                                <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                                   {expandedVariant === v.id ? <ChevronUp className="w-5 h-5 text-slate-300 group-hover:text-orange-400" /> : <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-orange-400" />}
                                </div>
                             </div>
                          </div>

                          {expandedVariant === v.id && (
                             <div className="px-12 py-12 bg-slate-50/30 border-t border-slate-50 animate-in slide-in-from-top-6 duration-700">
                                <div className="grid grid-cols-3 gap-16">
                                   <div className="space-y-6 text-center">
                                      <div className="w-full aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center text-slate-200 group-hover:border-orange-200 cursor-pointer overflow-hidden shadow-inner">
                                         <ImageIcon className="w-16 h-16 transition-transform hover:scale-110" />
                                      </div>
                                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Variation Image</p>
                                   </div>
                                   <div className="col-span-2 grid grid-cols-2 gap-10">
                                       <MatrixInput 
                                          label="Product Code (SKU)" 
                                          value={editForm?.sku || ""} 
                                          onChange={(val: string) => setEditForm({...editForm, sku: val})} 
                                          icon={<Tag className="w-5 h-5" />} 
                                       />
                                       <MatrixInput 
                                          label="Stock Level" 
                                          value={String(editForm?.stock || "0")} 
                                          onChange={(val: string) => setEditForm({...editForm, stock: parseInt(val) || 0})} 
                                          icon={<Package className="w-5 h-5" />} 
                                       />
                                       <MatrixInput 
                                          label="Price (₹)" 
                                          value={String(editForm?.price || "0")} 
                                          onChange={(val: string) => setEditForm({...editForm, price: parseFloat(val) || 0})} 
                                          icon={<IndianRupee className="w-5 h-5 text-orange-600" />} 
                                          isOrange 
                                       />
                                       <div className="flex items-end p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                          <label className="flex items-center gap-4 cursor-pointer">
                                             <input 
                                                type="checkbox" 
                                                checked={editForm?.isDefault || false} 
                                                onChange={e => setEditForm({...editForm, isDefault: e.target.checked})}
                                                className="w-6 h-6 accent-orange-600 rounded-lg shadow-inner" 
                                             />
                                             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Set as Default Selection</span>
                                          </label>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="mt-12 flex justify-end gap-6 pb-2">
                                    <button onClick={() => { setExpandedVariant(null); setEditForm(null); }} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-950 transition-all">Cancel</button>
                                    <button 
                                      onClick={() => handleUpdateVariant(v.id)}
                                      disabled={submitting}
                                      className="px-12 py-4 bg-[#0a0b10] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-22 active:scale-95 hover:bg-orange-600 transition-all flex items-center gap-2"
                                    >
                                      {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                      <span>Save Changes</span>
                                    </button>
                                 </div>
                             </div>
                          )}
                       </div>
                    ))}
                    {variants.length === 0 && (
                       <div className="py-24 text-center space-y-6 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                          <Grid3X3 className="w-16 h-16 text-slate-100 mx-auto" />
                          <p className="text-slate-300 font-bold italic tracking-wide">No variations added yet.</p>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {activeTab === "general" && (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-12">
                 <h3 className="text-3xl font-black text-slate-950 tracking-tight border-b border-slate-50 pb-8 uppercase tracking-widest text-sm">Basic Information</h3>
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                       <input value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-slate-950 outline-none focus:bg-white focus:border-orange-500 transition-all shadow-inner" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest ml-1">Friendly URL (Auto-generated)</label>
                       <input value={product?.slug} readOnly className="w-full px-8 py-5 bg-slate-100 border border-slate-100 rounded-[2rem] font-bold text-slate-300 italic cursor-not-allowed outline-none" />
                    </div>
                    <div className="col-span-2 space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                       <textarea rows={10} value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} className="w-full px-10 py-8 bg-slate-50 border border-slate-100 rounded-[3rem] font-bold text-slate-950 outline-none focus:bg-white focus:border-orange-500 transition-all resize-none shadow-inner" />
                    </div>
                 </div>
              </div>
           )}

           {activeTab === "stock" && (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-12">
                 <h3 className="text-3xl font-black text-slate-950 tracking-tight border-b border-slate-50 pb-8 uppercase tracking-widest text-sm">Inventory Management</h3>
                 <div className="bg-slate-50/50 border border-slate-100 p-12 rounded-[3.5rem] space-y-10 shadow-inner group hover:bg-white hover:border-orange-200 transition-all duration-700">
                    <div className="flex items-center justify-between">
                       <div className="space-y-2">
                          <p className="font-black text-slate-950 text-xl tracking-tight">Track Product Count</p>
                          <p className="text-sm font-bold text-slate-400">Automatically decrease stock when a customer buys this product.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer scale-125 mr-4">
                          <input type="checkbox" checked={prodForm.trackInventory} onChange={e => setProdForm({...prodForm, trackInventory: e.target.checked})} className="sr-only peer" />
                          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                       </label>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === "blueprint" && (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-12">
                 <div className="flex justify-between items-end border-b border-slate-50 pb-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-950 tracking-tight uppercase tracking-widest text-sm">Category Options</h3>
                      <p className="text-sm font-bold text-slate-400 mt-2">These options are inherited from the product category.</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {product?.category?.categoryAttributes?.map((attr: any) => (
                       <div key={attr.id} className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:border-orange-100 transition-all flex flex-col justify-between group h-[200px]">
                          <div>
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-orange-500 transition-colors">Setting</p>
                             <h4 className="text-2xl font-black text-slate-950 tracking-tight">{attr.name}</h4>
                          </div>
                          <div className="flex flex-wrap gap-3">
                              {attr.attributeOptions?.map((opt: any) => {
                                 const isColor = attr.type === 'SWATCH' && opt.displayValue?.startsWith('#');
                                 return (
                                    <span key={opt.id} className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all shadow-inner flex items-center gap-2">
                                       {isColor && (
                                         <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: opt.displayValue }} />
                                       )}
                                       {opt.image && (
                                         <img 
                                           src={opt.image.startsWith('http') ? opt.image : `${API_URL?.replace('/api', '')}${opt.image}`} 
                                           className="w-3.5 h-3.5 rounded-sm object-cover" 
                                         />
                                       )}
                                       {opt.value}
                                    </span>
                                 );
                              })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

        </main>
      </div>
    </div>
  );
}

function MatrixInput({ label, value, onChange, icon, isOrange }: any) {
  return (
    <div className="space-y-4">
       <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2">{label}</label>
       <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-orange-500 transition-colors">
             {icon}
          </div>
          <input 
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className={`w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-black outline-none transition-all shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-50 ${isOrange ? 'text-orange-600' : 'text-slate-950'}`}
          />
       </div>
    </div>
  );
}

function ModuleBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-5 px-8 py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${active ? 'bg-white text-orange-600 shadow-2xl shadow-orange-100/50 border border-slate-50 ring-1 ring-slate-100 scale-105' : 'text-slate-400 hover:text-slate-950 hover:bg-white/50'}`}
    >
      <div className={`transition-all duration-500 ${active ? 'scale-150 rotate-6' : ''}`}>
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
}
