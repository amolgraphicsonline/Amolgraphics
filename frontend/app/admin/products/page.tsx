"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, Package, Layers, Search, Trash2, Tag, Loader2, 
  ChevronRight, ShoppingBag, TrendingUp, Copy, Edit2, 
  MoreVertical, CheckSquare, Square, Filter, ArrowUpDown, 
  Eye, Archive, ArrowRight, X, Save, AlertCircle,
  Download, Upload
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams?.get('categoryId');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [duplicateLoading, setDuplicateLoading] = useState<string | null>(null);
  
  // Quick Edit State
  const [quickEditProduct, setQuickEditProduct] = useState<any>(null);
  const [quickEditData, setQuickEditData] = useState<any>({ name: "", price: 0, stock: 0 });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchProducts = () => {
    if (!API_URL) return;
    setLoading(true);
    const url = categoryFilter 
      ? `${API_URL}/products?categoryId=${categoryFilter}`
      : `${API_URL}/products`;
      
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [API_URL, categoryFilter]);

  const handleDelete = async (prod: any) => {
    const firstCheck = confirm(`Are you sure you want to delete "${prod.name}"? This will remove the catalog entry permanently.`);
    if (!firstCheck) return;
    
    const secondCheck = confirm(`DANGER: This action will permanently delete "${prod.name}" and all its variants. This CANNOT be undone. Are you absolutely sure?`);
    if (!secondCheck) return;

    try {
      const res = await fetch(`${API_URL}/products/${prod.id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to delete product");
        return;
      }
      
      setProducts(products.filter(p => p.id !== prod.id));
    } catch (error) {
       console.error(error);
       alert("An error occurred while deleting the product.");
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete selected products");
        return;
      }

      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("An error occurred during bulk delete");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicateLoading(id);
    try {
      const res = await fetch(`${API_URL}/products/${id}/duplicate`, { method: "POST" });
      if (res.ok) fetchProducts();
    } catch (error) {
       console.error(error);
    } finally {
      setDuplicateLoading(null);
    }
  };

  const handleQuickEdit = (prod: any) => {
    setQuickEditProduct(prod);
    setQuickEditData({
      name: prod.name,
      price: prod.variants && prod.variants.length > 0 
        ? Math.min(...prod.variants.map((v: any) => parseFloat(v.salePrice) || parseFloat(v.price) || 0))
        : prod.salePrice || prod.regularPrice || 0,
      stock: prod.variants?.[0]?.stock ?? prod.stockQuantity ?? 0,
      sku: prod.variants?.[0]?.sku || prod.sku || ""
    });
  };

  const handleSaveQuickEdit = async () => {
    if (!API_URL || !quickEditProduct) return;
    try {
      const res = await fetch(`${API_URL}/products/${quickEditProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickEditData.name,
          regularPrice: quickEditData.price,
          stock: quickEditData.stock,
          sku: quickEditData.sku
        })
      });

      if (!res.ok) throw new Error("Failed to update product");

      setQuickEditProduct(null);
      fetchProducts();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === products.length ? [] : products.map(p => p.id));
  };

  const getStockStatus = (prod: any) => {
    const totalStock = prod.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
    if (totalStock === 0) return { label: "Out of Stock", color: "text-red-500 bg-red-50 border-red-100" };
    if (totalStock < 10) return { label: "Low Stock", color: "text-orange-500 bg-orange-50 border-orange-100" };
    return { label: "In Stock", color: "text-green-600 bg-green-50 border-green-100" };
  };

  const handleExport = () => {
    if (!API_URL) return;
    window.open(`${API_URL}/products/export`, '_blank');
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/products/import`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchProducts();
      } else {
        alert(data.error || "Import failed");
      }
    } catch (error) {
       console.error(error);
       alert("An error occurred during import");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Products</h1>
             <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[12px]  capitalize tracking-wider rounded-lg border border-blue-200 shadow-sm">
               {products.length} Items
             </span>
             {categoryFilter && (
               <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 text-[12px]  capitalize tracking-wider rounded-lg border border-amber-200 shadow-sm animate-pulse">
                  <span>Filtered View</span>
                  <button onClick={() => router.push('/admin/products')} className="ml-1 p-0.5 hover:bg-amber-100 rounded-full transition-colors"><X size={12} /></button>
               </div>
             )}
          </div>
          <p className="text-base  text-slate-900 mt-1 capitalize tracking-[0.1em] text-[12px] opacity-60">Manage your store catalog</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="p-2.5 hover:bg-white rounded-xl border border-slate-300 transition-all text-slate-900 hover:text-blue-600 bg-slate-50 shadow-sm flex items-center gap-2 px-4"
          >
            <Download className="w-4 h-4" />
            <span className="text-[12px] font-medium capitalize tracking-widest hidden md:block">Export</span>
          </button>

          <label className="p-2.5 hover:bg-white rounded-xl border border-slate-300 transition-all text-slate-900 hover:text-blue-600 bg-slate-50 shadow-sm flex items-center gap-2 px-4 cursor-pointer">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="text-[12px] font-medium capitalize tracking-widest hidden md:block">
              {importing ? "Importing..." : "Import"}
            </span>
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
          </label>

          <div className="h-4 w-px bg-slate-200 mx-2" />

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-900 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search catalog..."
              className="pl-11 pr-5 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] font-medium text-slate-900 focus:border-blue-500 transition-all outline-none w-72 shadow-sm"
            />
          </div>
          
          <Link 
            href="/admin/products/create"
            className="flex items-center gap-2 bg-blue-600 px-6 py-2.5 rounded-xl text-white font-medium capitalize tracking-wider text-[11px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Bulk Action / Filter Bar - Refined */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-300 shadow-sm px-6">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <button onClick={toggleSelectAll} className="text-slate-200 hover:text-blue-600 transition-colors">
                    {selectedIds.length === products.length && products.length > 0 ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                 </button>
                 <span className="text-[11px] font-medium text-slate-900 capitalize tracking-widest">{selectedIds.length} Selected</span>
              </div>
              <div className="h-4 w-px bg-slate-100" />
              <div className="flex items-center gap-2">
                 <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium text-slate-500 capitalize tracking-widest hover:border-blue-200 hover:bg-white transition-all flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Filter
                 </button>
                 <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium text-slate-500 capitalize tracking-widest hover:border-blue-200 hover:bg-white transition-all flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" /> Sort
                 </button>
              </div>
           </div>
           
           <div className={`flex gap-3 transition-all duration-500 ${selectedIds.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-medium capitalize tracking-widest hover:bg-blue-700 transition-all active:scale-95">Bulk Edit</button>
               <button 
                  onClick={handleBulkDelete}
                  className="px-5 py-2 border border-rose-100 bg-rose-50 text-rose-500 rounded-lg text-[12px] font-medium capitalize tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
               >
                 Delete
               </button>
           </div>
        </div>

        {/* Product Table - Clean */}
        <div className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden">
          {loading ? (
             <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-[12px] font-medium text-slate-900 capitalize tracking-[0.2em]">Updating Inventory...</p>
             </div>
          ) : products.length === 0 ? (
             <div className="py-32 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-300 text-slate-300">
                   <Package className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-medium text-slate-950 tracking-tight">Empty Catalog</h3>
                   <p className="text-base font-medium text-slate-900 max-w-xs mx-auto mt-2">You haven't listed any items yet.</p>
                </div>
                <Link 
                  href="/admin/products/create"
                  className="inline-flex py-3 px-8 bg-blue-600 text-white rounded-xl font-medium text-[11px] capitalize tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                   Add First Product
                </Link>
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                         <th className="px-8 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest w-16">
                         </th>
                         <th className="px-4 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest">Product</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest">Inventory</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest">Value</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest">Modified</th>
                         <th className="px-8 py-4 text-[12px] font-medium text-slate-900 capitalize tracking-widest text-right"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {products.map((prod, idx) => {
                         const stock = getStockStatus(prod);
                         const isSelected = selectedIds.includes(prod.id);
                         
                         return (
                            <tr key={prod.id} className={`group transition-all hover:bg-slate-50/50 ${isSelected ? 'bg-blue-50/20' : ''}`}>
                               <td className="px-8 py-6">
                                  <button onClick={() => toggleSelect(prod.id)} className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-200 hover:text-blue-400'}`}>
                                     {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                  </button>
                               </td>
                               <td className="px-4 py-6">
                                  <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
                                        {prod.mainImage ? (
                                          <img 
                                            src={prod.mainImage.startsWith('http') ? prod.mainImage : `${API_URL?.replace('/api', '')}${prod.mainImage}`} 
                                            className="w-full h-full object-cover" 
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                            <ImageIcon className="w-6 h-6" />
                                          </div>
                                        )}
                                     </div>
                                     <div className="space-y-1">
                                        <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors capitalize text-[13px] tracking-tight">{prod.name}</h4>
                                        <div className="flex items-center gap-3">
                                           <span className="text-[12px] font-medium text-slate-900 capitalize tracking-wider">{prod.category?.name || 'Catalog'}</span>
                                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                                           <span className="text-[12px] font-medium text-blue-500 capitalize tracking-wider">{prod.variants?.length || 0} variants</span>
                                        </div>
                                        {/* Actions reveal on hover */}
                                         <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 text-[12px] font-medium text-slate-900 capitalize tracking-wider">
                                           <button onClick={() => handleQuickEdit(prod)} className="hover:text-blue-600">Quick Edit</button>
                                           <Link href={`/admin/products/${prod.id}/edit`} className="hover:text-blue-600">Full Edit</Link>
                                           <button onClick={() => handleDuplicate(prod.id)} disabled={duplicateLoading === prod.id} className="hover:text-blue-600 disabled:opacity-30">Duplicate</button>
                                         </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-medium capitalize tracking-wider ${stock.color} border-current/10`}>
                                     <div className={`w-1 h-1 rounded-full ${stock.label === 'In Stock' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                                     {stock.label}
                                  </div>
                               </td>
                               <td className="px-6 py-6 font-inter">
                                  <div className="flex flex-col">
                                     {prod.variants && prod.variants.length > 0 ? (
                                       <>
                                          <span className="text-[11px]  text-indigo-500 capitalize tracking-widest mb-1 opacity-70">Starting from</span>
                                          <span className="text-base  text-slate-950 leading-none">
                                             ₹{Math.min(...prod.variants.map((v: any) => parseFloat(v.salePrice) || parseFloat(v.price) || 0)).toLocaleString()}
                                          </span>
                                       </>
                                     ) : (
                                       <>
                                          <span className="text-base  text-slate-950 leading-none">₹{(prod.salePrice || prod.regularPrice || 0).toLocaleString()}</span>
                                          {prod.salePrice && <span className="text-[12px] font-medium text-slate-300 line-through mt-1.5 opacity-60">₹{prod.regularPrice}</span>}
                                       </>
                                     )}
                                  </div>
                               </td>
                               <td className="px-6 py-6">
                                  <div className="flex flex-col">
                                     <span className="text-[12px] font-medium text-slate-600">{new Date(prod.updatedAt).toLocaleDateString()}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button onClick={() => handleDelete(prod)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          )}
        </div>
      </div>

      {/* Quick Edit Overlay - Sleeker */}
      {quickEditProduct && (
         <div className="fixed inset-0 z-[100] bg-blue-900/10 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 tracking-tight capitalize">Quick Modification</h3>
                    <p className="text-[12px] font-medium text-slate-900 capitalize tracking-widest mt-0.5">Streamlined inventory update</p>
                  </div>
                  <button onClick={() => setQuickEditProduct(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                     <X className="w-5 h-5 text-slate-900" />
                  </button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[12px] font-medium text-slate-900 capitalize tracking-widest ml-1">Label</label>
                     <input 
                       value={quickEditData.name} onChange={e => setQuickEditData({...quickEditData, name: e.target.value})}
                       className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-950 outline-none focus:bg-white focus:border-blue-500 transition-all text-base"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-slate-900 capitalize tracking-widest ml-1">Pricing (₹)</label>
                        <input 
                          type="number" value={quickEditData.price} onChange={e => setQuickEditData({...quickEditData, price: e.target.value})}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-blue-600 outline-none focus:bg-white focus:border-blue-500 transition-all text-base"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px] font-medium text-slate-900 capitalize tracking-widest ml-1">Stock Units</label>
                        <input 
                          type="number" value={quickEditData.stock} onChange={e => setQuickEditData({...quickEditData, stock: e.target.value})}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-950 outline-none focus:bg-white focus:border-blue-500 transition-all text-base"
                        />
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]`} />
                        <span className="text-[12px] font-medium text-slate-900 capitalize tracking-widest">Active Status: {quickEditProduct.status}</span>
                     </div>
                     <button className="text-[12px] font-medium text-blue-600 capitalize tracking-widest hover:underline">Change</button>
                  </div>
               </div>
               
               <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                  <button onClick={() => setQuickEditProduct(null)} className="px-6 py-2.5 text-[11px] font-medium capitalize tracking-widest text-slate-400 hover:text-slate-600 transition-all">Dismiss</button>
                  <button onClick={handleSaveQuickEdit} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-medium capitalize tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Update Entry</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
       <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
       <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
