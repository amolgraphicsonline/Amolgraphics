"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Layers, Plus, Save, Trash2, ChevronLeft, Loader2, AlertCircle, Info, Settings, ShieldAlert, Image as ImageIcon } from "lucide-react";

type Option = { id?: string; value: string; displayValue: string; image: string; price: number; thickness?: string; mounting?: string; uploading?: boolean };
type Attribute = { id?: string; name: string; type: string; options: Option[] };

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
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
       
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description || "");
        setImage(data.image || "");
        setParentId(data.parentId || "");
        setTags(data.tags || "");
       
        // Map categoryAttributes and attributeOptions to frontend structure
        const mappedAttributes = (data.categoryAttributes || []).map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          type: attr.type,
          options: (attr.attributeOptions || []).map((opt: any) => ({
            id: opt.id,
            value: opt.value,
            displayValue: opt.displayValue || "",
            image: opt.image || "",
            price: opt.price || 0,
            thickness: opt.thickness || "",
            mounting: opt.mounting || ""
          }))
        }));
        setAttributes(mappedAttributes);
        setCategories(allCats.filter((c: any) => c.id !== categoryId)); // Don't allow selecting itself as parent
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, categoryId]);

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

  const updateOption = (attrIndex: number, optIndex: number, field: keyof Option, value: any) => {
    setAttributes(prev => {
      const updated = [...prev];
      const currentAttr = { ...updated[attrIndex] };
      const updatedOptions = [...currentAttr.options];
      const currentOpt = { ...updatedOptions[optIndex], [field]: value };
     
      // Auto-sync displayValue if value is a hex code
      if (field === "value" && typeof value === 'string' && value.startsWith("#") && (value.length === 4 || value.length === 7)) {
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

  const handleOptionImageUpload = async (attrIndex: number, optIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;

    updateOption(attrIndex, optIndex, "uploading", true as any);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        updateOption(attrIndex, optIndex, "image", data.url);
      } else {
        setError(data.error || "Image upload failed");
      }
    } catch (err) {
      setError("Failed to upload image.");
    } finally {
      updateOption(attrIndex, optIndex, "uploading", false as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // 1. Update Basic Details
      const res = await fetch(`${API_URL}/categories/${categoryId}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, slug, description, image, parentId: parentId || null, tags })
      });
     
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.code) {
           throw new Error(`DB<${errorData.code}>: ${errorData.description || errorData.error || 'Failed to update basic details'}`);
        }
        throw new Error(errorData.error || "Failed to update category details.");
      }

      // 2. Sync New Settings & Choices (Product Options)
      for (const attr of attributes) {
        let currentAttrId = attr.id;

        // 1. Create OR Update Attribute
        if (!currentAttrId) {
          if (!attr.name) continue;
          const attrRes = await fetch(`${API_URL}/categories/${categoryId}/attributes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: attr.name, type: attr.type })
          });
          const newAttr = await attrRes.json();
          if (!attrRes.ok) {
            if (newAttr.code) throw new Error(`DB<${newAttr.code}>: ${newAttr.description || newAttr.error || `Error creating setting: ${attr.name}`}`);
            throw new Error(newAttr.error || `Failed to create setting: ${attr.name}`);
          }
          currentAttrId = newAttr.id;
        } else {
          // Update Existing Attribute
          const updateAttrRes = await fetch(`${API_URL}/categories/attributes/${currentAttrId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: attr.name, type: attr.type })
          });
          if (!updateAttrRes.ok) {
            const updateAttrData = await updateAttrRes.json().catch(() => ({}));
            const msg = updateAttrData.code 
              ? `DB<${updateAttrData.code}>: ${updateAttrData.description || updateAttrData.error || 'Sync Failure'}`
              : (updateAttrData.error || `Failed to update setting: ${attr.name}`);
            setError(msg);
            setSubmitting(false);
            return;
          }
        }

        // 2. Loop through choices for this setting
        for (const opt of attr.options) {
          if (!opt.id) {
            // Create NEW Choice
            if (!opt.value) continue;
            const optRes = await fetch(`${API_URL}/categories/attributes/${currentAttrId}/options`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: opt.value, displayValue: opt.displayValue, image: opt.image, price: opt.price, thickness: opt.thickness, mounting: opt.mounting })
            });
            if (!optRes.ok) {
              const optData = await optRes.json().catch(() => ({}));
              const msg = optData.code 
                ? `DB<${optData.code}>: ${optData.description || optData.error || 'Sync Failure'}`
                : (optData.error || `Failed to add choice: ${opt.value}`);
              setError(msg);
              setSubmitting(false);
              return; // Halt execution and show error in red box
            }
          } else {
            // Update EXISTING Choice
            const updateOptRes = await fetch(`${API_URL}/categories/options/${opt.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: opt.value, displayValue: opt.displayValue, image: opt.image, price: opt.price, thickness: opt.thickness, mounting: opt.mounting })
            });
            if (!updateOptRes.ok) {
              const updateOptData = await updateOptRes.json().catch(() => ({}));
              const msg = updateOptData.code 
                ? `DB<${updateOptData.code}>: ${updateOptData.description || updateOptData.error || 'Sync Failure'}`
                : (updateOptData.error || `Failed to update choice: ${opt.value}`);
              setError(msg);
              setSubmitting(false);
              return; // Halt execution
            }
          }
        }
      }

      alert("Category updated successfully.");
      router.push("/admin/categories");
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "An unexpected error occurred during save.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? Deleting this category will remove all associated products. This cannot be undone.")) return;
    setSubmitting(true);
    try {
       const res = await fetch(`${API_URL}/categories/${categoryId}`, { method: 'DELETE' });
       if (res.ok) router.push("/admin/categories");
    } catch (err: any) {
       setError(err.message);
    } finally {
       setSubmitting(false);
    }
  }

  const handleDeleteAttribute = async (attrId: string, index: number) => {
    if (!attrId) {
      removeAttribute(index);
      return;
    }
    if (!confirm("This will permanently remove this option set from the category. Continue?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/attributes/${attrId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setAttributes(attributes.filter((_, i) => i !== index));
      } else {
        if (data.code) throw new Error(`DB<${data.code}>: ${data.description || data.error || 'Failed to delete setting'}`);
        throw new Error(data.error || "Failed to delete setting.");
      }
    } catch (err: any) {
      console.error("Delete Setting Error:", err);
      setError(err.message);
    }
  };

  const handleDeleteOption = async (attrIndex: number, optId: string, optIndex: number) => {
    if (!optId) {
      removeOption(attrIndex, optIndex);
      return;
    }
    setError("");
    if (!confirm("Delete this choice?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/options/${optId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setAttributes(prev => {
          const updated = [...prev];
          const updatedAttr = { ...updated[attrIndex] };
          updatedAttr.options = updatedAttr.options.filter((_, i) => i !== optIndex);
          updated[attrIndex] = updatedAttr;
          return updated;
        });
      } else {
        if (data.code) throw new Error(`DB<${data.code}>: ${data.description || data.error || 'Failed to delete choice'}`);
        throw new Error(data.error || "Failed to delete choice.");
      }
    } catch (err: any) {
      console.error("Delete Choice Error:", err);
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
       <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
       <p className="text-[10px] font-medium   text-slate-700">Loading Category Details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans pb-20 text-slate-900">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-800 hover:text-slate-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-col">
              <h1 className="text-xl font-medium text-blue-600 tracking-tight leading-none">Category Editor</h1>
              <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight mt-1 italic">Taxonomy Matrix v2.0</span>
            </div>
          </div>
         
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => handleDelete()}
              disabled={submitting}
              className="px-6 py-2.5 text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-all  "
            >
              Decommission Node
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-blue-600 text-white font-medium tracking-tight text-[11px] rounded-xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center gap-2.5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Commit Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-10 py-10">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-medium text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
             <AlertCircle className="w-5 h-5" />
             {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
          <div className="lg:col-span-2 space-y-8">
           
            {/* Basic Details Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden">
               <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-slate-900">Basic Details</h2>
                    <p className="text-xs font-medium text-slate-500 tracking-tight">Main information and branding of the category</p>
                  </div>
               </div>
              
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-slate-950   ml-1">Category Name</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Acrylic Photo Frames"
                        value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-slate-950   ml-1">Parent Category</label>
                      <select 
                        value={parentId} onChange={e => setParentId(e.target.value)}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none cursor-pointer"
                      >
                        <option value="">None (Top Level)</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-slate-900   ml-1">URL Shortcut (Slug)</label>
                      <input 
                        type="text" value={slug} onChange={e => setSlug(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-medium text-slate-800   ml-1">Category Image</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex items-center justify-center gap-2 w-full px-5 py-4 bg-white border border-slate-200 border-dashed rounded-2xl font-medium text-slate-800 hover:bg-white hover:border-blue-500 transition-all cursor-pointer">
                            <Plus className="w-5 h-5 text-blue-500" />
                            <span>{image ? "Change Image" : "Upload Local Image"}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                        {image && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 animate-in zoom-in duration-300">
                             <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${image}`} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea 
                      rows={3}
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-orange-50 transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-medium text-slate-800   ml-1">Layout Tags (for Homepage Sections)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Wall Decor, Desk Decor (comma separated)"
                      value={tags} onChange={e => setTags(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                    />
                    <p className="text-[10px] text-slate-400 font-medium  tracking-tight ml-1">Use these to group categories into sections on your homepage.</p>
                  </div>
               </div>
            </div>

            {/* Product Options Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <div>
                  <h2 className="text-xl font-medium tracking-tight">Product Options</h2>
                  <p className="text-sm font-medium text-slate-700 mt-1">Configure choices like Size, Color, or Material</p>
                </div>
                <button 
                  type="button" 
                  onClick={addAttribute}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-xs   hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              </div>

              <div className="space-y-6">
                {attributes.map((attr, attrIndex) => (
                  <div key={attrIndex} className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden animate-in fade-in slide-in-from-top-6 duration-500">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                      <div className="flex items-center gap-4 flex-1 max-w-md">
                         <input 
                          placeholder="Option Name (e.g. Size)" 
                          value={attr.name} onChange={e => updateAttribute(attrIndex, "name", e.target.value)}
                          className="bg-transparent border-none text-lg font-medium text-slate-950 placeholder:text-slate-500 outline-none w-full"
                         />
                      </div>
                      <div className="flex items-center gap-4">
                        <select 
                          value={attr.type} onChange={e => updateAttribute(attrIndex, "type", e.target.value)}
                          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                        >
                          <option value="SELECT">Classic Dropdown</option>
                          <option value="BUTTON_GROUP">Selection Tiles</option>
                          <option value="SWATCH">Color Samples</option>
                        </select>
                        <button 
                          type="button" onClick={() => handleDeleteAttribute(attr.id || "", attrIndex)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                       <div className="flex flex-wrap gap-4 items-center">
                          {attr.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex flex-col gap-3 bg-white border border-slate-200 rounded-[2rem] p-6 group hover:border-blue-200 transition-all shadow-sm">
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 mt-2 animate-in fade-in transition-all">
                                     <div className="space-y-1.5">
                                       <label className="text-[9px] font-medium text-slate-800   ml-1 block">Thickness</label>
                                       <input 
                                         placeholder="e.g. 3 MM"
                                         value={opt.thickness || ""} onChange={e => updateOption(attrIndex, optIndex, "thickness", e.target.value)}
                                         className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                       />
                                     </div>
                                     <div className="space-y-1.5">
                                       <label className="text-[9px] font-medium text-slate-800   ml-1 block">Mounting</label>
                                       <input 
                                         placeholder="e.g. Tape"
                                         value={opt.mounting || ""} onChange={e => updateOption(attrIndex, optIndex, "mounting", e.target.value)}
                                         className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                       />
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3 mt-3">
                                   <div className="flex-1">
                                     <label className="text-[9px] font-medium text-slate-800   ml-1 mb-1 block">Value Name</label>
                                     <input 
                                       placeholder="Value"
                                       value={opt.value} onChange={e => updateOption(attrIndex, optIndex, "value", e.target.value)}
                                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium text-slate-950 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                     />
                                   </div>
                                   <button 
                                     type="button"
                                     onClick={() => handleDeleteOption(attrIndex, opt.id || "", optIndex)}
                                     className="mt-5 p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 mt-2 animate-in fade-in transition-all">
                                     <div className="space-y-1.5">
                                       <label className="text-[9px] font-medium text-slate-800   ml-1 block">Unit Cost (₹)</label>
                                       <input 
                                         type="number"
                                         placeholder="0.00"
                                         value={opt.price} 
                                         onChange={e => updateOption(attrIndex, optIndex, "price", parseFloat(e.target.value) || 0)}
                                         className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-medium text-blue-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                       />
                                     </div>
                                     <div className="space-y-1.5">
                                       <label className="text-[9px] font-medium text-slate-800   ml-1 block">Swatch Color</label>
                                       <div className="flex items-center gap-2">
                                       <div className="relative w-10 h-10 rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
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
                                           className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-slate-950 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                           placeholder="#HEX"
                                         />
                                       </div>
                                     </div>
                                     <div className="space-y-1.5 col-span-2">
                                       <label className="text-[9px] font-medium text-slate-800   ml-1 block">Image Swatch Overlay</label>
                                       <div className="flex items-center gap-2">
                                         <input 
                                           placeholder="Image URL"
                                           value={opt.image} onChange={e => updateOption(attrIndex, optIndex, "image", e.target.value)}
                                           className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[9px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                         />
                                         <label className="p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-white hover:border-blue-500 transition-all">
                                           {opt.uploading ? <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 text-slate-700" />}
                                           <input type="file" className="hidden" accept="image/*" onChange={(e) => handleOptionImageUpload(attrIndex, optIndex, e)} />
                                         </label>
                                       </div>
                                     </div>
                                   </div>
                             </div>
                          ))}
                          <button 
                            type="button" onClick={() => addOption(attrIndex)}
                            className="px-5 py-2.5 bg-orange-50 text-blue-600 rounded-2xl text-[10px] font-medium   border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> 
                            <span>Add Choice</span>
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <div className="flex items-center gap-3 mb-2">
                 <Settings className="w-5 h-5 text-slate-700" />
                 <h3 className="text-sm font-medium text-slate-900  ">Category Summary</h3>
               </div>
              
               <div className="space-y-5">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-medium text-slate-800  tracking-tight">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[10px] font-medium text-blue-600 ">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-medium text-slate-800  tracking-tight">Structure</span>
                    <span className="text-xs font-medium text-slate-900">{attributes.length} Options</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-medium text-slate-800  tracking-tight">Total Values</span>
                    <span className="text-xs font-medium text-slate-900">
                      {attributes.reduce((acc, a) => acc + a.options.length, 0)} Added
                    </span>
                  </div>
               </div>

               <div className="pt-4 p-4 bg-orange-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-[11px] font-medium text-orange-700 leading-relaxed italic">
                    Updating this category will affect every product currently assigned here.
                  </p>
               </div>
            </div>

            <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100 space-y-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                   <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-medium text-lg text-slate-900">Important Note</h3>
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  Be careful while removing options. Deleting an option might affect products that are already using it.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

