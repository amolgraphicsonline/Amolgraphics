"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, Tag, Trash2, Search, Loader2, ArrowLeft, MoreVertical, Edit2, X, Save
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
  logo?: string;
  slug: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", logo: "", slug: "" });
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/brands`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setForm({ name: brand.name, logo: brand.logo || "", slug: brand.slug });
    } else {
      setEditingBrand(null);
      setForm({ name: "", logo: "", slug: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingBrand ? "PATCH" : "POST";
      const url = editingBrand ? `${API_URL}/brands/${editingBrand.id}` : `${API_URL}/brands`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        fetchBrands();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save brand:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBrands(brands.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700 min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
           <Link href="/admin/products/create" className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shadow-sm">
             <ArrowLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl  text-slate-900 capitalize tracking-tight">Identity Brands</h1>
              <p className="text-[12px]  text-slate-400 capitalize tracking-[0.2em] mt-1">Manage vendor and brand profiles</p>
           </div>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 bg-blue-600 px-6 py-3.5 rounded-2xl text-white  text-[11px] capitalize tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 shadow-blue-500/20"
        >
          <Plus size={16} />
          <span>Onboard New Brand</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-slate-100 shadow-sm">
           <Loader2 className="w-10 h-10 text-[#ff3f6c] animate-spin" />
           <p className="text-[12px]  capitalize text-slate-400 tracking-[0.3em] mt-6">Fetching Directories</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[32px] border border-slate-100 shadow-sm">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
             <Tag size={32} />
           </div>
           <h3 className="text-xl  text-slate-900 mb-2 capitalize">No Brands Found</h3>
           <p className="text-base text-slate-400 max-w-sm mx-auto mb-10">Add brands to help organize products and improve your catalog's professional identity.</p>
           <button 
             onClick={() => handleOpenModal()} 
             className="px-8 py-4 bg-blue-600 text-white rounded-2xl  text-[11px] capitalize tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
           >
             Create First Brand Profile
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {brands.map(brand => (
             <div key={brand.id} className="group bg-white rounded-[32px] p-8 border border-slate-100 hover:border-[#ff3f6c]/20 transition-all shadow-sm hover:shadow-2xl overflow-hidden relative">
                <div className="flex flex-col items-center text-center gap-6">
                   <div className="w-20 h-20 bg-[#f8f9fb] rounded-3xl flex items-center justify-center border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      {brand.logo ? (
                         <img src={brand.logo} className="w-full h-full object-contain p-2" />
                      ) : (
                         <Tag size={28} className="text-slate-200" />
                      )}
                   </div>
                   <div>
                      <h3 className="text-[15px]  text-slate-900 capitalize tracking-tight mb-1">{brand.name}</h3>
                      <p className="text-[12px]  text-slate-300 capitalize tracking-[0.1em]">Slug: {brand.slug}</p>
                   </div>
                </div>
                
                <div className="flex justify-center gap-3 mt-8 pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                      onClick={() => handleOpenModal(brand)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
                   >
                      <Edit2 size={16} />
                   </button>
                   <button 
                      onClick={() => handleDelete(brand.id)}
                      className="p-3 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="mb-10 text-center">
                 <div className="w-14 h-14 bg-[#ff3f6c]/5 rounded-2xl flex items-center justify-center text-[#ff3f6c] mx-auto mb-6 shadow-inner">
                    <Tag size={24} />
                 </div>
                 <h2 className="text-xl  text-slate-900 capitalize tracking-tight">{editingBrand ? 'Modify Identity' : 'Onboard Brand'}</h2>
                 <p className="text-[11px]  text-slate-400 capitalize tracking-[0.2em] mt-2">Enter official brand parameters</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1 leading-none">Legal Brand Name</label>
                       <input 
                         required
                         value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                         placeholder="e.g. Apple INC"
                         className="w-full px-5 py-3.5 bg-[#f8f9fb] border border-slate-100 rounded-2xl  text-base text-slate-900 outline-none focus:bg-white focus:border-slate-800 transition-all shadow-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1 leading-none">Brand Identifier (Slug)</label>
                       <input 
                         value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                         placeholder="apple-inc"
                         className="w-full px-5 py-3.5 bg-[#f8f9fb] border border-slate-100 rounded-2xl  text-base text-slate-400 outline-none focus:bg-white shadow-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1 leading-none">Logo URL</label>
                       <input 
                         value={form.logo} onChange={e => setForm({...form, logo: e.target.value})}
                         placeholder="https://official.logo/brand.png"
                         className="w-full px-5 py-3.5 bg-[#f8f9fb] border border-slate-100 rounded-2xl  text-base text-slate-400 outline-none focus:bg-white shadow-sm"
                       />
                    </div>
                 </div>
                 
                 <button 
                   type="submit"
                   disabled={saving}
                   className="w-full py-5 bg-slate-900 text-white rounded-[24px]  text-[11px] capitalize tracking-[0.3em] hover:bg-[#ff3f6c] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                 >
                   {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                   {editingBrand ? 'Sync Identity' : 'Onboard to Catalog'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
