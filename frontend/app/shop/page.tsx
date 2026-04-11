"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Loader2, Package, Filter, ChevronLeft, Menu } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { CategoryBanner } from "@/components/ui/CategoryBanner";

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number;
  mainImage: string;
  status: string;
  category: { name: string, slug?: string };
  isDesign?: boolean;
  tags?: string;
  isReadyToSale?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

const resolveMedia = (path: string, apiUrl: string) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith('http')) return path;
  const baseUrl = apiUrl.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlTag = searchParams.get("tag");
  const urlQ = searchParams.get("q");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
    if (urlQ) setSearchQuery(urlQ);
  }, [urlCategory, urlQ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, designRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/product-designs`)
        ]);
        
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const designData = await designRes.json();
        
        const productsList: ShopItem[] = (Array.isArray(prodData) ? prodData : []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            regularPrice: p.regularPrice || 0,
            salePrice: p.salePrice || 0,
            mainImage: p.mainImage || "",
            isReadyToSale: p.isReadyToSale || false,
            status: p.status || "PUBLISHED",
            category: { name: p.category?.name || "Uncategorized", slug: p.category?.slug || "" },
            tags: p.tags || ""
        }));

        const designsList: ShopItem[] = (Array.isArray(designData) ? designData : []).map(d => ({
            id: d.id,
            name: d.name,
            slug: d.slug || d.id,
            regularPrice: d.priceAdjustment || 399,
            salePrice: 0,
            mainImage: d.previewImage || "",
            status: "PUBLISHED",
            category: { 
               name: d.category ? d.category.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : "Acrylic",
               slug: d.category || ""
            },
            isDesign: true,
            tags: d.category
        }));

        setItems([...productsList, ...designsList]);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || 
                           item.category.name.toLowerCase() === activeCategory.toLowerCase() || 
                           item.category.slug?.toLowerCase() === activeCategory.toLowerCase() ||
                           (activeCategory === "Acrylic Wall Clocks" && item.category.name.includes("Clock"));
    
    let matchesTag = true;
    if (urlTag) {
      const tags = item.tags ? item.tags.split(',').map((t: string) => t.trim().toLowerCase()) : [];
      matchesTag = tags.includes(urlTag.toLowerCase());
    }

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isVisible = item.status === "PUBLISHED" || item.isDesign;
    
    return matchesCategory && matchesTag && matchesSearch && isVisible;
  });

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-gray-400">Loading Products...</p>
       </div>
    </div>
  );

  const topCategories = categories.filter(c => !c.parentId).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Breadcrumb row */}
      <div className="bg-white border-b border-gray-200 py-3">
         <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <div className="flex gap-2">
               <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
               <span>/</span>
               <span className="text-red-500">{activeCategory === "All" ? "All Products" : activeCategory}</span>
            </div>
            <div>
               {filteredItems.length} Products Found
            </div>
         </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
         <aside className={`transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-12' : 'w-full md:w-64'} flex flex-col gap-6 sticky top-4 h-fit`}>
            <div className="bg-white border border-gray-200 p-4 shadow-sm">
               <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  {!collapsed && (
                     <h3 className="text-sm font-black uppercase text-gray-800 flex items-center gap-2">
                        <Filter size={14} className="text-red-500" /> Categories
                     </h3>
                  )}
                  <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-red-500 transition-colors">
                     {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                  </button>
               </div>
               
               {!collapsed && (
                  <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-2">
                     <button 
                        onClick={() => setActiveCategory("All")}
                        className={`px-3 py-2 text-sm font-bold uppercase tracking-tight text-left transition-colors border-l-4 ${activeCategory === 'All' ? 'border-red-500 bg-red-50 text-red-500' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-red-500'}`}
                     >
                        ALL
                     </button>
                     {topCategories.map(cat => (
                        <button 
                           key={cat.id}
                           onClick={() => setActiveCategory(cat.name)}
                           className={`px-3 py-2 text-sm font-bold uppercase tracking-tight text-left transition-colors border-l-4 ${activeCategory === cat.name ? 'border-red-500 bg-red-50 text-red-500' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-red-500'}`}
                        >
                           {cat.name}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </aside>

         <div className="flex-1 min-w-0">
            {/* Category Banner */}
            <CategoryBanner categoryId={categories.find(c => c.name === activeCategory || c.slug === activeCategory)?.id} />

            {filteredItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                     <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 uppercase mb-2">No Products Found</h4>
                  <p className="text-sm text-gray-500 mb-6">We couldn't find any products matching your selection.</p>
                  <button onClick={() => { setActiveCategory("All"); setSearchQuery(""); }} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-sm rounded shadow-md transition-colors">
                     Clear Filters
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredItems.map((p) => (
                     <div key={p.id} className="bg-white border border-gray-200 group hover:shadow-lg transition-all rounded p-2 flex flex-col">
                        <Link 
                           href={p.isDesign || !p.isReadyToSale ? `/studio-v2?category=${p.category.slug}` : `/products/${p.id}`} 
                           className="relative aspect-square overflow-hidden bg-gray-50 mb-3 block"
                        >
                           <img src={resolveMedia(p.mainImage, API_URL)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <div className="flex flex-col flex-1 px-2 pb-2 text-center">
                           <Link 
                              href={p.isDesign || !p.isReadyToSale ? `/studio-v2?category=${p.category.slug}` : `/products/${p.id}`} 
                              className="text-sm font-bold text-gray-800 hover:text-red-500 line-clamp-2 uppercase leading-tight mb-2"
                           >
                              {p.name}
                           </Link>
                           <div className="mt-auto">
                              <span className="text-red-500 font-bold text-base">
                                 {p.isReadyToSale ? `₹${p.salePrice || p.regularPrice}/-` : `Starting From ₹${p.salePrice || p.regularPrice}/-`}
                              </span>
                           </div>
                           <button 
                              onClick={() => {
                                 if(!p.isDesign && p.isReadyToSale) {
                                    addToCart({
                                       id: p.id,
                                       productId: p.id,
                                       name: p.name,
                                       price: p.salePrice || p.regularPrice,
                                       image: resolveMedia(p.mainImage, API_URL),
                                       quantity: 1
                                    } as any);
                                    setIsOpen(true);
                                 } else {
                                    window.location.href = `/studio-v2?category=${p.category.slug || p.category.name}`;
                                 }
                              }}
                              className="mt-3 w-full py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded"
                           >
                              {p.isDesign || !p.isReadyToSale ? 'Customize' : 'Buy Now'}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </main>
    </div>
  );
}
