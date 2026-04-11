"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Upload, Trash2, Search, Loader2, Copy, 
  CheckCircle2, Plus, Filter, LayoutGrid, List,
  Image as ImageIcon, Grid3X3, Package, Square, CheckSquare
} from "lucide-react";

interface MediaItem {
  id: string; // we'll use name as id if not provided
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const MEDIA_BASE = API_URL.replace('/api', '');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files?.length) return;
     setUploading(true);
     console.log(`[MediaLibrary] Starting upload for ${e.target.files.length} assets...`);
     const files = Array.from(e.target.files);
     
     for (const file of files) {
       const formData = new FormData();
       formData.append("image", file);
       console.log(`[MediaLibrary] Uploading: ${file.name} to ${API_URL}/upload`);

       try {
         const res = await fetch(`${API_URL}/upload`, {
           method: "POST",
           body: formData,
           mode: 'cors'
         });

         if (res.ok) {
           console.log(`[MediaLibrary] SUCCESS: ${file.name}`);
           await fetchMedia();
         } else {
           const errText = await res.text();
           console.error(`[MediaLibrary] FAILED: HTTP ${res.status} - ${errText}`);
           alert(`Upload FAILED (${file.name}): ${errText || res.statusText}`);
         }
       } catch (err) {
         console.error(`[MediaLibrary] NETWORK ERROR:`, err);
         alert(`Network Error: Backend likely unreachable at ${API_URL}`);
       }
     }
     setUploading(false);
     e.target.value = ""; // Reset input
   };

  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch(`${API_URL}/upload/${filename}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMedia(prev => prev.filter(m => m.name !== filename));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} assets? This cannot be undone.`)) return;

    try {
      setLoading(true);
      for (const filename of selectedIds) {
         await fetch(`${API_URL}/upload/${filename}`, {
            method: "DELETE",
         });
      }
      setMedia(prev => prev.filter(m => !selectedIds.includes(m.name)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("An error occurred during bulk delete");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (filename: string) => {
    setSelectedIds(prev => prev.includes(filename) ? prev.filter(x => x !== filename) : [...prev, filename]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? [] : filteredMedia.map(m => m.name));
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${MEDIA_BASE}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const filteredMedia = media.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-inter pb-20 overflow-x-hidden">
      
      {/* Editorial Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="max-w-[1500px] mx-auto px-8 py-6 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-[#ff3f6c]/10 rounded-lg flex items-center justify-center text-[#ff3f6c]">
                 <ImageIcon size={18} />
              </div>
              <h1 className="text-xl  text-slate-900 capitalize tracking-tighter">Media Library</h1>
            </div>
            <p className="text-[12px] text-slate-400 font-medium capitalize tracking-widest pl-11">Manage brand assets and listings</p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#ff3f6c] transition-colors" />
              <input 
                placeholder="Search repository..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-base font-medium outline-none focus:bg-white focus:border-[#ff3f6c]/30 transition-all"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><LayoutGrid size={18}/></button>
               <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><List size={18}/></button>
            </div>
            <label className="h-12 px-6 bg-[#ff3f6c] text-white rounded-xl flex items-center gap-3 cursor-pointer hover:bg-[#ef2b5a] transition-all shadow-lg shadow-pink-500/10 active:scale-95 text-[11px]  capitalize tracking-widest">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Media
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10">
        
        {/* Filtering & Layout Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
           <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                 <span className="text-[12px]  text-slate-400 capitalize tracking-tighter">Storage Usage</span>
                 <p className="text-base  text-slate-900">{media.length} OBJECTS</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex gap-4">
                 {['newest', 'oldest', 'name'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className={`text-[11px]  capitalize tracking-widest px-4 py-1.5 rounded-full border transition-all ${sortBy === opt ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                       {opt}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Bulk Action Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm px-6 mb-8">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <button onClick={toggleSelectAll} className="text-slate-200 hover:text-blue-600 transition-colors">
                    {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                 </button>
                 <span className="text-[11px] font-medium text-slate-400 capitalize tracking-widest">{selectedIds.length} Selected</span>
              </div>
           </div>
           
           <div className={`flex gap-3 transition-all duration-500 ${selectedIds.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
               <button 
                  onClick={handleBulkDelete}
                  className="px-5 py-2 border border-rose-100 bg-rose-50 text-rose-500 rounded-lg text-[12px] font-medium capitalize tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
               >
                 <Trash2 size={14}/> Bulk Delete
               </button>
           </div>
        </div>

        {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-200 gap-4">
               <Loader2 size={48} className="animate-spin text-slate-100" />
               <p className="text-[12px] font-medium capitalize tracking-[0.3em]">Restructuring UI...</p>
            </div>
        ) : (
          filteredMedia.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-300 gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                    <Package size={32} />
                </div>
                <div className="text-center">
                   <p className="text-[12px]  capitalize tracking-[0.3em] mb-2 leading-none">The Vault is empty</p>
                   <p className="text-[11px] font-medium opacity-60">UPLOAD ASSETS TO GROW YOUR REPOSITORY</p>
                </div>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {filteredMedia.map(item => {
                   const isSelected = selectedIds.includes(item.name);
                   return (
                   <div key={item.name} className={`group relative aspect-square bg-white rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 ${isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100 hover:border-[#ff3f6c]/20'}`}>
                      <img 
                        src={item.url.startsWith('http') ? item.url : `${MEDIA_BASE}${item.url}`} 
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isSelected ? 'opacity-80 scale-105' : ''}`}
                        alt={item.name}
                      />
                      
                      {/* Checkbox Overlay */}
                      <button onClick={() => toggleSelect(item.name)} className="absolute top-4 left-4 z-20">
                         {isSelected ? <CheckSquare className="w-6 h-6 text-blue-500 drop-shadow-md bg-white rounded-md" /> : <Square className="w-6 h-6 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-x-3 bottom-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl border border-white">
                         <div className="flex flex-col max-w-[60%] overflow-hidden">
                            <span className="text-[12px]  text-slate-900 truncate capitalize leading-none mb-1">{item.name}</span>
                            <span className="text-[12px] font-medium text-slate-400">{(item.size / 1024).toFixed(0)} KB</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button 
                               onClick={() => copyToClipboard(item.url, item.name)} 
                               className={`p-2 rounded-lg transition-all ${copyingId === item.name ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-blue-600'}`}
                            >
                               {copyingId === item.name ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
                            </button>
                            <button onClick={() => handleDelete(item.name)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={12}/></button>
                         </div>
                      </div>
                   </div>
                   );
                })}
              </div>
            ) : (
               <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50 text-[12px]  capitalize tracking-widest text-slate-400 border-b border-slate-100">
                           <th className="px-6 py-5 w-12">
                               <button onClick={toggleSelectAll} className="text-slate-300 hover:text-blue-600 transition-colors">
                                  {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                               </button>
                           </th>
                           <th className="px-4 py-5">Preview</th>
                           <th className="px-8 py-5">Filename</th>
                           <th className="px-8 py-5">Metric</th>
                           <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredMedia.map(item => {
                           const isSelected = selectedIds.includes(item.name);
                           return (
                           <tr key={item.name} className={`group hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                              <td className="px-6 py-4">
                                  <button onClick={() => toggleSelect(item.name)} className="text-slate-300 hover:text-blue-600 transition-colors">
                                     {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                                  </button>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-white shadow-sm ring-1 ring-slate-100">
                                    <img src={item.url.startsWith('http') ? item.url : `${MEDIA_BASE}${item.url}`} className="w-full h-full object-cover" alt="" />
                                 </div>
                              </td>
                              <td className="px-8 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-base  text-slate-900 capitalize tracking-tight">{item.name}</span>
                                    <span className="text-[12px] font-medium text-slate-400 tracking-tighter capitalize">{new Date(item.createdAt).toLocaleDateString()}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-4 text-base font-medium text-slate-500 capitalize tracking-tighter">{(item.size / 1024).toFixed(1)} KB</td>
                              <td className="px-8 py-4">
                                 <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                       onClick={() => copyToClipboard(item.url, item.name)}
                                       className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px]  capitalize tracking-widest transition-all ${copyingId === item.name ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 group'}`}
                                    >
                                       {copyingId === item.name ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
                                       {copyingId === item.name ? 'Copied' : 'Copy URL'}
                                    </button>
                                    <button onClick={() => handleDelete(item.name)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                                 </div>
                              </td>
                           </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )
          )
        )}
      </main>
    </div>
  );
}
