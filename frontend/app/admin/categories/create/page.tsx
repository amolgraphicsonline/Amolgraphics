"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, Save, Trash2, ChevronLeft, Loader2, AlertCircle, Package, Info, CheckCircle2 } from "lucide-react";

type Option = { value: string; displayValue: string; image: string; price: number; thickness?: string; mounting?: string; uploading?: boolean };
type Attribute = { name: string; type: string; options: Option[] };

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Base Category State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  // Dynamic Attributes State
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to load categories", err));
  }, [API_URL]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
      } else {
        setError(data.error || "Image upload failed");
      }
    } catch (err) {
      setError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", type: "SELECT", options: [] }]);
  };

  const updateAttribute = (index: number, field: keyof Attribute, value: any) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addOption = (attrIndex: number) => {
    const updated = [...attributes];
    updated[attrIndex] = {
      ...updated[attrIndex],
      options: [...updated[attrIndex].options, { value: "", displayValue: "", image: "", price: 0, thickness: "", mounting: "" }]
    };
    setAttributes(updated);
  };

  const updateOption = (attrIndex: number, optIndex: number, field: keyof Option, value: string) => {
    setAttributes(prev => {
      const updated = [...prev];
      const currentAttr = { ...updated[attrIndex] };
      const updatedOptions = [...currentAttr.options];
      const currentOpt = { ...updatedOptions[optIndex], [field]: value };
      
      // Auto-sync displayValue if value is a hex code
      if (field === "value" && value.startsWith("#") && (value.length === 4 || value.length === 7)) {
         currentOpt.displayValue = value;
      }

      updatedOptions[optIndex] = currentOpt;
      currentAttr.options = updatedOptions;
      updated[attrIndex] = currentAttr;
      return updated;
    });
  };

  const removeOption = (attrIndex: number, optIndex: number) => {
    setAttributes(prev => {
      const updated = [...prev];
      const updatedAttr = { ...updated[attrIndex] };
      updatedAttr.options = updatedAttr.options.filter((_, i) => i !== optIndex);
      updated[attrIndex] = updatedAttr;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !image) return setError("Name, Slug, and Category Image are required.");
    if (!API_URL) return setError("API Configuration missing.");
    setLoading(true);
    setError("");

    try {
      // 1. Create Category
      const catRes = await fetch(`${API_URL}/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, image, parentId: parentId || null, tags })
      });
      const category = await catRes.json();
      if (!catRes.ok) {
        const msg = category.code 
          ? `DB<${category.code}>: ${category.description || category.error || 'Sync Failure'}`
          : (category.error || "Failed to create category.");
        setError(msg);
        setLoading(false);
        return;
      }

      // 2. Loop Attributes
      for (const attr of attributes) {
        if (!attr.name) continue;
        
        const attrRes = await fetch(`${API_URL}/categories/${category.id}/attributes`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: attr.name, type: attr.type })
        });
        const createdAttr = await attrRes.json();
        if (!attrRes.ok) {
          const msg = createdAttr.code 
            ? `DB<${createdAttr.code}>: ${createdAttr.description || createdAttr.error || 'Sync Failure'}`
            : (createdAttr.error || `Failed to create setting: ${attr.name}`);
          setError(msg);
          setLoading(false);
          return;
        }

        // 3. Loop Options for this Attribute
        for (const opt of attr.options) {
          if (!opt.value) continue;
          const optRes = await fetch(`${API_URL}/categories/attributes/${createdAttr.id}/options`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: opt.value, displayValue: opt.displayValue, image: opt.image, price: opt.price, thickness: opt.thickness, mounting: opt.mounting })
          });
          if (!optRes.ok) {
            const optData = await optRes.json().catch(() => ({}));
            const msg = optData.code 
              ? `DB<${optData.code}>: ${optData.description || optData.error || 'Sync Failure'}`
              : (optData.error || `Failed to add choice: ${opt.value}`);
            setError(msg);
            setLoading(false);
            return;
          }
        }
      }

      router.push("/admin/categories");
    } catch (err: any) {
      console.error("Creation Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-md transition-all text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <h1 className="text-lg font-medium text-slate-900 leading-none">Create Category</h1>
              <span className="text-base  text-slate-900 mt-1 capitalize tracking-widest opacity-70">Add a new product category</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-base font-medium rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Category</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-center gap-3 text-red-700 font-medium text-[13px] shadow-sm animate-in fade-in slide-in-from-top-2">
             <AlertCircle className="w-4 h-4 shrink-0" />
             {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Details Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-[11px]  text-blue-600 capitalize">Basic Details</h2>
                    <p className="text-[11px]  text-slate-900 capitalize tracking-tight opacity-70">Main information about this sector</p>
                  </div>
               </div>
               
               <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px]  text-slate-950 capitalize tracking-widest ml-1">Category Name</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Acrylic Photo Frames"
                        value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-base text-slate-900 focus:bg-white focus:border-[blue-600] transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px]  text-slate-950 capitalize tracking-widest ml-1">Parent Category (Optional)</label>
                      <select 
                        value={parentId} onChange={e => setParentId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-base text-slate-900 focus:bg-white focus:border-[blue-600] transition-all outline-none cursor-pointer"
                      >
                        <option value="">None (Top Level)</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px]  text-slate-900 capitalize tracking-widest ml-1">URL Shortcut (Slug)</label>
                      <input 
                        type="text" readOnly value={slug}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-base text-slate-950 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px]  text-slate-800 capitalize tracking-widest ml-1">Category Image *</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 border-dashed rounded-xl font-medium text-base text-slate-800 hover:bg-white hover:border-blue-600 transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-blue-600" />
                            <span>{image ? "Change Image" : "Upload Local Image"}</span>
                            <input type="file" className="hidden" accept="image/*,.webp,.avif" onChange={handleImageUpload} />
                          </label>
                        </div>
                        {image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 animate-in zoom-in duration-300">
                             <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${image}`} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px]  text-slate-800 capitalize tracking-widest ml-1">Category Description</label>
                    <textarea 
                      rows={2}
                      placeholder="What kind of products belong in this category?"
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-base text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px]  text-slate-800 capitalize tracking-widest ml-1">Layout Tags (for Homepage Sections)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Wall Decor, Desk Decor (comma separated)"
                      value={tags} onChange={e => setTags(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-base text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none"
                    />
                    <p className="text-[11px] text-slate-950  capitalize tracking-tight ml-1 opacity-70">Group categories into sections on your homepage.</p>
                  </div>
               </div>
            </div>

            {/* Product Options Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <div>
                  <h2 className="text-xl font-medium text-slate-900 tracking-tight">Product Options</h2>
                  <p className="text-base  text-slate-900 mt-1 opacity-70">Add options like Size, Color, or Material for this category</p>
                </div>
                <button 
                  type="button" 
                  onClick={addAttribute}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-base capitalize tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              </div>

              <div className="space-y-6">
                {attributes.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-24 text-center border border-slate-200 group">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-slate-300 group-hover:text-blue-600" />
                    </div>
                    <p className="text-slate-800 font-medium text-xl">No Options Added</p>
                    <p className="text-slate-900 font-medium max-w-sm mx-auto mt-2">Add options so that products in this category can have different Sizes, Shapes, or Styles.</p>
                  </div>
                ) : (
                  attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-6 duration-500">
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-4 flex-1 max-w-sm">
                           <input 
                            placeholder="Option Name (e.g. Size)" 
                            value={attr.name} onChange={e => updateAttribute(attrIndex, "name", e.target.value)}
                            className="bg-transparent border-none text-base  text-slate-950 placeholder:text-slate-400 outline-none w-full"
                           />
                        </div>
                        <div className="flex items-center gap-3">
                          <select 
                            value={attr.type} onChange={e => updateAttribute(attrIndex, "type", e.target.value)}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[12px]  capitalize tracking-widest text-slate-700 outline-none focus:border-blue-500 transition-all"
                          >
                            <option value="SELECT">Classic Dropdown</option>
                            <option value="BUTTON_GROUP">Selection Tiles</option>
                            <option value="SWATCH">Color Samples</option>
                          </select>
                          <button 
                            type="button" onClick={() => removeAttribute(attrIndex)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                             {attr.options.map((opt, optIndex) => (
                               <div key={optIndex} className="flex flex-col gap-3 bg-white border border-slate-100 rounded-2xl p-4 group hover:border-blue-200 transition-all shadow-sm relative">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1 mb-1 block">Value</label>
                                      <input 
                                        placeholder="e.g. XL"
                                        value={opt.value} onChange={e => updateOption(attrIndex, optIndex, "value", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-base  text-slate-950 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                      />
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => removeOption(attrIndex, optIndex)}
                                      className="mt-4 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                   <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 mt-1">
                                    <div className="space-y-1">
                                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Thickness</label>
                                      <input 
                                        placeholder="e.g. 3 MM"
                                        value={opt.thickness || ""} onChange={e => updateOption(attrIndex, optIndex, "thickness", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-800 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Mounting</label>
                                      <input 
                                        placeholder="e.g. Tape"
                                        value={opt.mounting || ""} onChange={e => updateOption(attrIndex, optIndex, "mounting", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-800 outline-none"
                                      />
                                    </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 mt-1">
                                    <div className="space-y-1">
                                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Unit Cost (₹)</label>
                                      <input 
                                        type="number"
                                        placeholder="0.00"
                                        value={opt.price} 
                                        onChange={e => updateOption(attrIndex, optIndex, "price", e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[12px] font-medium text-blue-600 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1 block">Swatch Color</label>
                                      <div className="flex items-center gap-1.5">
                                        <div className="relative w-7 h-7 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                          <input 
                                            type="color" 
                                            value={opt.displayValue || "#000000"} 
                                            onChange={e => updateOption(attrIndex, optIndex, "displayValue", e.target.value)}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] cursor-pointer border-none p-0 bg-transparent"
                                          />
                                        </div>
                                        <input 
                                          type="text"
                                          value={opt.displayValue || "#000000"}
                                          onChange={e => updateOption(attrIndex, optIndex, "displayValue", e.target.value)}
                                          className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[11px] font-mono font-medium text-slate-900 outline-none w-full"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                      <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1 block">Image Swatch</label>
                                      <div className="flex items-center gap-1">
                                        <input 
                                          placeholder="URL"
                                          value={opt.image} onChange={e => updateOption(attrIndex, optIndex, "image", e.target.value)}
                                          className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[12px] font-medium text-slate-800 outline-none w-full"
                                        />
                                        <label className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-white hover:border-blue-500 transition-all">
                                          {uploading ? <Loader2 className="w-3 h-3 text-blue-500 animate-spin" /> : <Package className="w-3 h-3 text-slate-400" />}
                                          <input type="file" className="hidden" accept="image/*,.webp,.avif" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if(!file || !API_URL) return;
                                            updateOption(attrIndex, optIndex, "uploading", true as any);
                                            const fd = new FormData();
                                            fd.append("image", file);
                                            const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd });
                                            const data = await res.json();
                                            if(res.ok && data.url) updateOption(attrIndex, optIndex, "image", data.url);
                                            updateOption(attrIndex, optIndex, "uploading", false as any);
                                          }} />
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                               </div>
                             ))}
                            <button 
                              type="button" onClick={() => addOption(attrIndex)}
                              className="px-4 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[11px]  capitalize tracking-widest border border-blue-100 border-dashed hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 h-full min-h-[100px]"
                            >
                              <Plus className="w-5 h-5" /> 
                              <span>Add Choice</span>
                            </button>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
               <div className="flex items-center gap-3 mb-1">
                 <Info className="w-4 h-4 text-slate-400" />
                 <h3 className="text-[11px]  text-slate-900 capitalize tracking-widest">Category Summary</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-[11px]  text-slate-900 capitalize tracking-tight opacity-70">Status</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-[11px]  text-green-600 capitalize">Ready</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-[11px] font-medium text-slate-500 capitalize tracking-tight">Options</span>
                    <span className="text-[11px]  text-slate-900 capitalize">{attributes.length} Sets</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[11px] font-medium text-slate-500 capitalize tracking-tight">Syncing</span>
                    <span className="text-[11px]  text-blue-600 capitalize tracking-tighter">Enabled</span>
                  </div>
               </div>

               <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[12px] font-medium text-blue-700 leading-relaxed italic">
                    Note: These settings will apply to every product you add to this category.
                  </p>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                   <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className=" text-base capitalize tracking-tight text-blue-900">Pro Tip</h3>
                <p className="text-[11px] text-blue-600/70 font-medium leading-relaxed">
                   Our system automatically links these options to prices when you add a new product.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

