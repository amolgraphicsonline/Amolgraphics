"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Trash2, Loader2, AlertCircle, CheckCircle2, 
  ToggleLeft, ToggleRight, Upload, ChevronLeft, 
  ImageIcon, Edit2, X, Layout
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  categoryId: string | null;
  isActive: boolean;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    categoryId: "",
    isActive: true,
  });

  const fetchBanners = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/banners/all`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        if (editingBanner) {
            setEditingBanner(prev => prev ? { ...prev, imageUrl: data.url } : null);
        } else {
            setForm(f => ({ ...f, imageUrl: data.url }));
        }
      } else setError("Image upload failed");
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_URL) return;
    setSaving(true);
    setError("");
    
    const isEditing = !!editingBanner;
    const url = isEditing ? `${API_URL}/banners/${editingBanner.id}` : `${API_URL}/banners`;
    const method = isEditing ? "PUT" : "POST";
    const body = isEditing ? editingBanner : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(isEditing ? "Banner updated!" : "Banner created!");
      setShowForm(false);
      setEditingBanner(null);
      setForm({ title: "", subtitle: "", imageUrl: "", categoryId: "", isActive: true });
      fetchBanners();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?") || !API_URL) return;
    try {
      await fetch(`${API_URL}/banners/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch {
      setError("Failed to delete");
    }
  };

  const toggleActive = async (banner: Banner) => {
    if (!API_URL) return;
    try {
      await fetch(`${API_URL}/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      fetchBanners();
    } catch {
      setError("Failed to update");
    }
  };

  const resolveMedia = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL?.replace("/api", "")}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-base font-bold text-slate-900">Banner Management</h1>
              <p className="text-xs text-slate-400">Manage promotional banners for category pages</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingBanner(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl font-medium text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
          </div>
        )}

        {/* Form Modal */}
        {(showForm || editingBanner) && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{editingBanner ? "Edit Banner" : "New Category Banner"}</h3>
                <button onClick={() => { setShowForm(false); setEditingBanner(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Banner Title *</label>
                  <input required 
                    value={editingBanner ? editingBanner.title : form.title} 
                    onChange={e => editingBanner 
                        ? setEditingBanner({ ...editingBanner, title: e.target.value })
                        : setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Premium Acrylic Frames"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Subtitle</label>
                  <input 
                    value={(editingBanner ? editingBanner.subtitle : form.subtitle) || ""} 
                    onChange={e => editingBanner
                        ? setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                        : setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Frameless Brilliance Starting @ 549/-"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Category Mapping</label>
                        <select 
                            value={(editingBanner ? editingBanner.categoryId : form.categoryId) || ""}
                            onChange={e => editingBanner
                                ? setEditingBanner({ ...editingBanner, categoryId: e.target.value })
                                : setForm({ ...form, categoryId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Banner Image</label>
                    <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 border border-blue-200 border-dashed rounded-xl cursor-pointer hover:bg-blue-100 transition-all text-sm font-bold text-blue-700">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {uploading ? "Uploading..." : "Upload Banner Image"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        {(editingBanner?.imageUrl || form.imageUrl) && (
                            <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                <img src={resolveMedia(editingBanner?.imageUrl || form.imageUrl)} className="w-full h-full object-cover" alt="preview" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layout className="w-4 h-4" />} 
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingBanner(null); }} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Banners List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ImageIcon className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-bold text-slate-900">No banners yet</p>
            <p className="text-slate-400 text-sm mt-1">Create promotional banners for your category pages</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div key={b.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-[21/9] relative bg-slate-100 overflow-hidden">
                  <img src={resolveMedia(b.imageUrl)} className="w-full h-full object-cover" alt={b.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-white font-bold text-lg">{b.title}</h3>
                    {b.subtitle && <p className="text-white/80 text-xs font-medium">{b.subtitle}</p>}
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {b.category?.name || "Global"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                  <button onClick={() => toggleActive(b)} className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${b.isActive ? "bg-green-500/90 text-white" : "bg-slate-500/90 text-white"}`}>
                    {b.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {b.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditingBanner(b)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
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
