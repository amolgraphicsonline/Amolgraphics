"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, Tag, Layers, Settings2, Package, Trash2, Search, 
  ChevronRight, MoreVertical, Filter, ArrowUpDown, 
  ChevronDown, Edit2, LayoutGrid, List as ListIcon,
  Image as ImageIcon, FolderTree, Loader2, GripVertical, ChevronRightSquare,
  ArrowUpCircle, ArrowDownCircle, Save, GripHorizontal, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string | null;
  products?: any[];
  _count?: { products: number };
  categoryAttributes?: any[];
  children: CategoryNode[];
  order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isSorted, setIsSorted] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data: any) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Categories fetch error:", err);
        setCategories([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const buildTree = (flatList: any[]): CategoryNode[] => {
    if (!Array.isArray(flatList)) return [];
    
    const map = new Map<string, CategoryNode>();
    flatList.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    const roots: CategoryNode[] = [];
    const sortedList = [...map.values()].sort((a, b) => a.order - b.order);
    
    sortedList.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Recursively sort children
    const sortChildren = (nodes: CategoryNode[]) => {
      nodes.forEach(n => {
        if (n.children.length > 0) {
          n.children.sort((a, b) => a.order - b.order);
          sortChildren(n.children);
        }
      });
    };
    sortChildren(roots);

    return roots;
  };

  const tree = useMemo(() => buildTree(categories), [categories]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the category and all its products permanently.")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }
      
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
       console.error(error);
       alert("An error occurred while deleting the category.");
    }
  };

  // --- REORDER LOGIC ---
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const node = categories.find(c => c.id === id);
    if (!node) return;

    let peers = categories.filter(c => c.parentId === node.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = peers.findIndex(p => p.id === id);

    if (direction === 'up' && index > 0) {
      handleDropAt(id, index - 1, peers);
    } else if (direction === 'down' && index < peers.length - 1) {
      handleDropAt(id, index + 1, peers);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDropAt = (sId: string, tIdx: number, peerList: any[]) => {
    const sIdx = peerList.findIndex(p => p.id === sId);
    if (sIdx === -1) return;

    const newPeers = [...peerList];
    const [movedItem] = newPeers.splice(sIdx, 1);
    newPeers.splice(tIdx, 0, movedItem);

    // Re-assign orders based on new positions within peers
    const orderMap = new Map();
    newPeers.forEach((p, idx) => {
      orderMap.set(p.id, idx);
    });

    const newCategories = categories.map(c => {
      if (orderMap.has(c.id)) {
        return { ...c, order: orderMap.get(c.id) };
      }
      return c;
    });

    setCategories(newCategories);
    setIsSorted(true);
    setDraggedId(null);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    
    const sourceNode = categories.find(c => c.id === draggedId);
    if (!sourceNode) return;

    const peers = categories.filter(c => c.parentId === sourceNode.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIndex = peers.findIndex(p => p.id === targetId);
    
    handleDropAt(draggedId, targetIndex, peers);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const items = categories.map(c => ({ id: c.id, order: c.order, parentId: c.parentId }));
      const res = await fetch(`${API_URL}/categories/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        setIsSorted(false);
      } else {
        alert("Failed to save sequence");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingOrder(false);
    }
  };

  // --- RECURSIVE ROW COMPONENT ---
  const CategoryRow = ({ node, level }: { node: CategoryNode, level: number }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <AnimatePresence mode="popLayout">
        <motion.tr 
          key={node.id}
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          draggable
          onDragStart={() => handleDragStart(node.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(node.id)}
          className={`group transition-all hover:bg-slate-50/50 cursor-move border-b border-slate-100 ${draggedId === node.id ? 'opacity-30 bg-blue-50' : ''} ${level > 0 ? 'bg-slate-50/20' : ''}`}
        >
          <td className="px-8 py-5">
            <div className="flex items-center gap-4" style={{ paddingLeft: `${level * 40}px` }}>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity mr-2">
                    <GripHorizontal className="w-4 h-4 text-slate-400 rotate-90" />
                    <div className="flex flex-col gap-0.5 ml-1">
                      <button onClick={() => handleMove(node.id, 'up')} className="text-slate-400 hover:text-blue-600 transition-colors"><ArrowUpCircle className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleMove(node.id, 'down')} className="text-slate-400 hover:text-blue-600 transition-colors"><ArrowDownCircle className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
                 {hasChildren ? (
                   <button 
                     onClick={(e) => toggleExpand(node.id, e)}
                     className="p-1 hover:bg-slate-200 rounded transition-colors"
                   >
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                   </button>
                 ) : (
                   <div className="w-6" /> // spacer
                 )}
              </div>

              <Link href={`/admin/categories/${node.id}/edit`} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {node.image ? (
                    <img 
                      src={node.image.startsWith('http') ? node.image : `${API_URL?.replace('/api', '')}${node.image}`} 
                      className="w-full h-full object-cover" 
                      alt={node.name}
                    />
                  ) : (
                    <Layers className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-blue-600 group-hover:text-blue-600 transition-colors capitalize text-[13px] font-medium tracking-normal">
                    {node.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 capitalize tracking-normal italic leading-none">
                    {level === 0 ? 'Root Taxonomy' : `Sub-category of ${node.parentId && categories.find((c: any) => c.id === node.parentId)?.name}`}
                  </p>
                </div>
              </Link>
            </div>
          </td>
          <td className="px-6 py-5">
             <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[12px]  capitalize rounded border border-blue-100/50">{node.categoryAttributes?.length || 0} attributes</span>
          </td>
          <td className="px-6 py-5">
             <Link 
               href={`/admin/products?categoryId=${node.id}`}
               className="flex items-center gap-2 text-blue-600/60 hover:text-blue-600 font-medium text-base capitalize transition-colors group/count"
             >
                <Package className="w-3.5 h-3.5 group-hover/count:scale-110 transition-transform" />
                <span className="text-slate-950 ">{node._count?.products || 0}</span>
                <ChevronRightSquare className="w-3 h-3 opacity-0 group-hover/count:opacity-100 transition-opacity ml-1" />
             </Link>
          </td>
          <td className="px-6 py-5">
             <code className="text-[11px]  text-slate-600 select-all group-hover:text-blue-600 transition-colors tracking-normaler">/{node.slug}</code>
          </td>
          <td className="px-8 py-5 text-right">
              <div className="flex justify-end items-center gap-2">
                 <Link 
                   href={`/admin/categories/${node.id}/edit`}
                   className="p-2 text-slate-400 hover:text-blue-600 transition-all hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-sm shadow-transparent hover:shadow-slate-100"
                 >
                    <Edit2 className="w-4 h-4" />
                 </Link>
                 <button 
                   onClick={() => handleDelete(node.id)}
                   className="p-2 text-slate-400 hover:text-rose-500 transition-all hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-sm shadow-transparent hover:shadow-slate-100"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
          </td>
        </motion.tr>
        {isExpanded && hasChildren && (
          node.children.map(child => <CategoryRow key={child.id} node={child} level={level + 1} />)
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="p-8 pb-20 max-w-[1700px] mx-auto animate-in fade-in duration-1000 min-h-screen bg-[#FAF9F6]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Categories</h1>
          <p className="text-base text-slate-500 mt-1">Manage your store's product categories and hierarchy.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 shadow-sm outline-none transition-all" 
              />
           </div>

           <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode("table")}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                title="List View"
              >
                 <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                title="Gallery View"
              >
                 <LayoutGrid className="w-4 h-4" />
              </button>
           </div>

           {isSorted && (
             <button 
               onClick={saveOrder}
               disabled={savingOrder}
               className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-4 py-2 rounded-lg text-slate-700 font-medium text-base hover:bg-slate-200 transition-all shadow-sm"
             >
               {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               <span>Save Order</span>
             </button>
           )}

           <Link 
             href="/admin/categories/create-wizard"
             className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg text-white font-medium text-base hover:bg-slate-800 transition-all shadow-sm"
           >
             <Sparkles className="w-4 h-4 text-blue-400" />
             <span>Product Wizard</span>
           </Link>

           <Link 
             href="/admin/categories/create"
             className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white font-medium text-base hover:bg-blue-700 transition-all shadow-sm"
           >
             <Plus className="w-4 h-4" />
             <span>Add Category</span>
           </Link>
        </div>
      </div>

      <div className="space-y-6">
        
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-base font-medium text-slate-500">Loading categories...</p>
           </div>
        ) : categories.length === 0 ? (
           <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 text-slate-400 mb-4">
                 <FolderTree className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">No categories found</h3>
              <p className="text-base text-slate-500 max-w-sm mx-auto mb-6">Create categories to organize your products and make them easier for customers to find.</p>
              <Link 
                href="/admin/categories/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
              >
                 <Plus className="w-4 h-4" /> Add your first category
              </Link>
           </div>
        ) : viewMode === "table" ? (
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[11px] font-medium text-slate-500  tracking-normal">Category</th>
                          <th className="px-6 py-4 text-[11px] font-medium text-slate-500  tracking-normal">Attributes</th>
                          <th className="px-6 py-4 text-[11px] font-medium text-slate-500  tracking-normal">Products</th>
                          <th className="px-6 py-4 text-[11px] font-medium text-slate-500  tracking-normal">Slug</th>
                          <th className="px-6 py-4 text-right text-[11px] font-medium text-slate-500  tracking-normal">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {tree.map(node => <CategoryRow key={node.id} node={node} level={0} />)}
                    </tbody>
                 </table>
              </div>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice().sort((a,b) => a.order - b.order).map((cat) => (
                 <div key={cat.id} className="group bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-all flex flex-col shadow-sm overflow-hidden">
                    <div className="aspect-[4/3] bg-slate-50 border-b border-slate-200 relative overflow-hidden flex items-center justify-center">
                       {cat.image ? (
                         <img 
                           src={cat.image.startsWith('http') ? cat.image : `${API_URL?.replace('/api', '')}${cat.image}`} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                           alt={cat.name}
                         />
                       ) : (
                         <Layers className="w-10 h-10 text-slate-300" />
                       )}
                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Link 
                            href={`/admin/categories/${cat.id}/edit`}
                            className="w-8 h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-sm border border-slate-200"
                         >
                            <Settings2 className="w-4 h-4" />
                         </Link>
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-base font-medium text-slate-900 mb-1">{cat.name}</h3>
                      <p className="text-base text-slate-500 mb-4 font-mono truncate">/{cat.slug}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                         <span className="text-base font-medium text-slate-700">
                            {cat.products?.length || 0} Products
                         </span>
                         <span className="text-base font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            {cat.categoryAttributes?.length || 0} Attributes
                         </span>
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
