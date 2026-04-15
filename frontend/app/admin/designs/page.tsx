"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  ToggleLeft, ToggleRight, Upload, ChevronLeft,
  ArrowUp, ArrowDown, ImageIcon, Layers, Edit2, X
} from "lucide-react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { EditorProvider } from "@/context/EditorContext";

interface ProductDesign {
  id: string;
  name: string;
  description: string | null;
  previewImage: string | null;
  layoutJson?: string | null;
  photoCount: number;
  category: string;
  isActive: boolean;
  sortOrder: number;
  shape: string | null;
  priceAdjustment?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SHAPES = [
  { value: "portrait",  label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "square",    label: "Square" },
  { value: "circle",    label: "Circle" },
  { value: "heart",     label: "Heart (Love)" },
  { value: "oval",      label: "Oval" },
  { value: "scalloped", label: "Scalloped" },
  { value: "blob",      label: "Organic Blob" },
  { value: "wave",      label: "Wave Edge" },
  { value: "collage-4", label: "Collage (4 Photo)" },
  { value: "grid",      label: "Grid (4 Photo)" },
];

const ALBUM_THEMES = [
  { value: "birthday", label: "Birthday" },
  { value: "international-travel", label: "International Travel" },
  { value: "life-events", label: "Life Events" },
  { value: "national-travel", label: "National Travel" },
  { value: "you-and-me", label: "You & Me" },
  { value: "general", label: "General" },
  { value: "family", label: "Family" },
  { value: "kids-and-babies", label: "Kids & Babies" },
  { value: "wedding", label: "Wedding" },
];

export default function AdminDesignsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [designs, setDesigns] = useState<ProductDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState<ProductDesign | null>(null);
  const [editingMeta, setEditingMeta] = useState<ProductDesign | null>(null);
  const [metaForm, setMetaForm] = useState<any>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    previewImage: "",
    photoCount: 1,
    priceAdjustment: 0,
    category: "",
    shape: "portrait",
  });

  const fetchCategories = async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setFilterCat(data[0].slug);
          setForm(f => ({ ...f, category: data[0].slug }));
        }
      }
    } catch {
      setError("Failed to load categories");
    } finally {
      setCatLoading(false);
    }
  };

  const fetchDesigns = async () => {
    if (!API_URL || !filterCat) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/product-designs/all?category=${filterCat}`);
      const data = await res.json();
      setDesigns(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (filterCat) fetchDesigns();
  }, [filterCat]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setForm(f => ({ ...f, previewImage: data.url }));
      else setError("Image upload failed");
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return setError("Design name is required");
    if (!API_URL) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/product-designs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: designs.length }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setSuccess("Design created!");
      setForm({ name: "", description: "", previewImage: "", photoCount: 1, priceAdjustment: 0, category: filterCat, shape: "portrait" });
      setShowForm(false);
      fetchDesigns();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to create design");
    } finally {
      setSaving(false);
    }
  };

  const handleDesignSave = async (dataUrl: string, json: string) => {
    if (!editingDesign || !API_URL) return;
    try {
      const res = await fetch(`${API_URL}/product-designs/${editingDesign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutJson: json, previewImage: dataUrl }),
      });
      if (!res.ok) throw new Error("Failed to save layout");
      setSuccess("Layout saved successfully!");
      setEditingDesign(null);
      fetchDesigns();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save layout");
    }
  };

  const toggleActive = async (design: ProductDesign) => {
    if (!API_URL) return;
    try {
      await fetch(`${API_URL}/product-designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !design.isActive }),
      });
      fetchDesigns();
    } catch {
      setError("Failed to update");
    }
  };

  const move = async (design: ProductDesign, direction: "up" | "down") => {
    if (!API_URL) return;
    const newOrder = direction === "up"
      ? Math.max(0, design.sortOrder - 1)
      : design.sortOrder + 1;
    await fetch(`${API_URL}/product-designs/${design.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: newOrder }),
    });
    fetchDesigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this design?") || !API_URL) return;
    try {
      await fetch(`${API_URL}/product-designs/${id}`, { method: "DELETE" });
      fetchDesigns();
    } catch {
      setError("Failed to delete");
    }
  };

  const handleEditMeta = (d: ProductDesign) => {
    setEditingMeta(d);
    setMetaForm({
      name: d.name,
      description: d.description || "",
      photoCount: d.photoCount,
      priceAdjustment: d.priceAdjustment || 0,
      shape: d.shape || "portrait",
      category: d.category,
      previewImage: d.previewImage || "",
    });
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeta || !API_URL) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/product-designs/${editingMeta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess("Design updated!");
      setEditingMeta(null);
      fetchDesigns();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update design");
    } finally {
      setSaving(false);
    }
  };

  const resolveMedia = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL?.replace("/api", "")}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Edit Metadata Modal */}
      {editingMeta && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div>
                <h3 className=" text-slate-900">Edit Design</h3>
                <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">{editingMeta.name}</p>
              </div>
              <button onClick={() => setEditingMeta(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateMeta} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">Design Name</label>
                  <input required value={metaForm.name} onChange={e => setMetaForm((f: any) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">Category</label>
                  <select value={metaForm.category} onChange={e => {
                    const newCat = e.target.value;
                    setMetaForm((f: any) => ({ 
                      ...f, 
                      category: newCat,
                      shape: newCat === 'photo-album' ? 'birthday' : 'portrait'
                    }));
                  }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base">
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">{metaForm.category === 'photo-album' ? 'Album Theme' : 'Shape Compatibility'}</label>
                  <select value={metaForm.shape} onChange={e => setMetaForm((f: any) => ({ ...f, shape: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base">
                    {(metaForm.category === 'photo-album' ? ALBUM_THEMES : SHAPES).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">No. of Photos</label>
                  <input type="number" min={1} max={20} value={metaForm.photoCount} onChange={e => setMetaForm((f: any) => ({ ...f, photoCount: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">Price Adjustment (₹)</label>
                  <input type="number" min={0} value={metaForm.priceAdjustment} onChange={e => setMetaForm((f: any) => ({ ...f, priceAdjustment: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">Description</label>
                  <input value={metaForm.description} onChange={e => setMetaForm((f: any) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all text-base" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px]  text-slate-400 capitalize tracking-widest">Preview Image</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 border-dashed rounded-xl cursor-pointer hover:bg-blue-100 transition-all text-base font-medium text-blue-700">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Replace Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !API_URL) return;
                      setUploading(true);
                      const fd = new FormData(); fd.append("image", file);
                      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd });
                      const data = await res.json();
                      if (res.ok && data.url) setMetaForm((f: any) => ({ ...f, previewImage: data.url }));
                      setUploading(false);
                    }} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl  text-base hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />} Save Changes
                </button>
                <button type="button" onClick={() => setEditingMeta(null)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium text-base hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Overlay */}
      {editingDesign && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="h-14 bg-blue-900 flex items-center justify-between px-6 flex-shrink-0 border-b border-white/5">
            <div className="flex items-center gap-3">
              <button onClick={() => setEditingDesign(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="h-5 w-px bg-white/20" />
              <div>
                <h2 className="text-base  text-white">Designing: {editingDesign.name}</h2>
                <p className="text-[12px] text-orange-400 font-medium capitalize tracking-widest">Admin Layout Editor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px]  text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20 animate-pulse capitalize tracking-widest leading-none">Admin Mode</span>
              <div className="h-5 w-px bg-white/20 mx-2" />
              <button
                onClick={() => setEditingDesign(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white text-base  rounded-lg border border-white/5 transition-all"
              >
                Exit
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <EditorProvider>
              <EditorLayout
                productType={editingDesign.category}
                mockupImage={editingDesign.previewImage || ""}
                onSave={(dataUrl, json) => handleDesignSave(dataUrl, json)}
              />
            </EditorProvider>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-base  text-slate-900">Product Designs</h1>
              <p className="text-base text-slate-400">Manage customizable designs per category</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setForm(f => ({ ...f, category: filterCat })); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-base font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Design
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl font-medium text-base">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl font-medium text-base">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {catLoading ? (
             <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-xl border border-slate-100 italic text-slate-400 text-[12px]  capitalize tracking-widest">
                <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing Categories...
             </div>
          ) : categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.slug)}
              className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${filterCat === cat.slug
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
            <h2 className=" text-slate-900 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> New Design
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest">Design Name *</label>
                <input
                  required
                  placeholder="e.g. Wedding Collage"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest">Category</label>
                <select
                  value={form.category}
                  onChange={e => {
                    const newCat = e.target.value;
                    setForm(f => ({ 
                      ...f, 
                      category: newCat,
                      shape: newCat === 'photo-album' ? 'birthday' : 'portrait'
                    }));
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest">Description</label>
                <input
                  placeholder="Short description shown to customer"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest">No. of Photos Required</label>
                <input
                  type="number" min={1} max={20}
                  value={form.photoCount}
                  onChange={e => setForm(f => ({ ...f, photoCount: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Shape / Theme Selection */}
              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest">{form.category === 'photo-album' ? 'Album Theme' : 'Shape Compatibility'}</label>
                <select
                  value={form.shape || (form.category === 'photo-album' ? 'birthday' : 'portrait')}
                  onChange={e => setForm(f => ({ ...f, shape: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  {(form.category === 'photo-album' ? ALBUM_THEMES : SHAPES).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-base  text-slate-500 capitalize tracking-widest text-[#002366]">Premium Surcharge (Price Adjustment)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number" min={0}
                    placeholder="0.00"
                    value={form.priceAdjustment}
                    onChange={e => setForm(f => ({ ...f, priceAdjustment: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl font-medium text-blue-600 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[12px] font-medium text-slate-400">Extra amount added to base product price for this design</p>
              </div>
            </div>

            {/* Preview Image */}
            <div className="space-y-3">
              <label className="text-base  text-slate-500 capitalize tracking-widest">Design Preview Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-5 py-3 bg-blue-50 border border-blue-200 border-dashed rounded-xl cursor-pointer hover:bg-blue-100 transition-all text-base font-medium text-blue-700">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload Preview Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {form.previewImage && (
                  <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={resolveMedia(form.previewImage)} className="w-full h-full object-cover" alt="preview" />
                  </div>
                )}
              </div>
              <p className="text-base text-slate-400">Upload a layout screenshot or mock-up image so the customer can see how the design will look</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl  text-base hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Design
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium text-base hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Designs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : designs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Layers className="w-7 h-7 text-slate-300" />
            </div>
            <p className=" text-slate-900 text-lg">No designs yet</p>
            <p className="text-slate-400 text-base mt-1">Click "Add Design" to create your first layout design for this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.map((d, idx) => (
              <div key={d.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${d.isActive ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                {/* Preview Image */}
                <div className="aspect-video bg-white flex items-center justify-center relative p-6">
                  {d.previewImage ? (
                    <img src={resolveMedia(d.previewImage)} className="w-full h-full object-contain" alt={d.name} />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-slate-200" />
                      <span className="text-base text-slate-300 font-medium">No preview</span>
                    </div>
                  )}
                  {/* Active badge */}
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[12px]  capitalize ${d.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                    {d.isActive ? "Active" : "Hidden"}
                  </div>
                  {/* Shape badge */}
                  {d.shape && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 px-2 py-1 rounded-lg text-[11px]  capitalize tracking-tight text-slate-600 shadow-sm">
                      {d.shape}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className=" text-slate-900">{d.name}</h3>
                      {d.description && <p className="text-base text-slate-400 mt-0.5">{d.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="bg-blue-50 text-blue-700 text-[12px]  px-2 py-1 rounded-lg border border-blue-100">
                        {d.photoCount} photo{d.photoCount > 1 ? "s" : ""}
                      </span>
                      {d.priceAdjustment && d.priceAdjustment > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[11px]  px-2 py-1 rounded-lg border border-emerald-100 capitalize tracking-tighter">
                          + ₹{d.priceAdjustment} Fee
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {/* Design Button */}
                    <button
                      onClick={() => setEditingDesign(d)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Layers className="w-4 h-4" /> Design
                    </button>

                    {/* Edit Metadata */}
                    <button
                      onClick={() => handleEditMeta(d)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-base font-medium hover:bg-slate-200 transition-colors"
                      title="Edit design details"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleActive(d)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-colors ${d.isActive ? "bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600" : "bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600"}`}
                      title={d.isActive ? "Click to hide" : "Click to show"}
                    >
                      {d.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    {/* Reorder */}
                    <button onClick={() => move(d, "up")} disabled={idx === 0} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => move(d, "down")} disabled={idx === designs.length - 1} className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${d.name}"? This cannot be undone.`)) {
                          handleDelete(d.id);
                        }
                      }} 
                      className="ml-auto p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 group"
                      title="Delete design"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
