"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Facebook, Twitter, Instagram, Youtube, MessageSquare } from "lucide-react";

const resolveMedia = (path: string, apiUrl: string) => {
   if (!path) return "/placeholder.jpg";
   if (path.startsWith('http')) return path;
   const baseUrl = apiUrl.replace('/api', '');
   const cleanPath = path.startsWith('/') ? path : `/${path}`;
   return `${baseUrl}${cleanPath}`;
};

const DragScroll = ({ children, className = "", autoScroll = false }: { children: React.ReactNode, className?: string, autoScroll?: boolean }) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const directionRef = useRef(1); 
   const animationRef = useRef<number>(0);
   const [isPaused, setIsPaused] = useState(false);

   const scrollBy = (amount: number) => {
      if (containerRef.current) {
         containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      }
   };

   useEffect(() => {
      if (!autoScroll || isPaused) return;
      
      const animate = () => {
         if (containerRef.current && !isPaused) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            const maxScroll = scrollWidth - clientWidth;

            if (maxScroll <= 5) return;

            if (directionRef.current === 1 && scrollLeft >= maxScroll - 2) {
               directionRef.current = -1;
            } else if (directionRef.current === -1 && scrollLeft <= 2) {
               directionRef.current = 1;
            }

            containerRef.current.scrollLeft += directionRef.current * 0.8;
         }
         animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
   }, [autoScroll, isPaused]);

   return (
      <div 
        className="relative group/nav w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
         <button 
           onClick={(e) => { e.preventDefault(); scrollBy(-400); }} 
           className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 text-[#1877F2] shadow-xl p-3 rounded-full opacity-0 group-hover/nav:opacity-100 transition-all md:-ml-4 border border-blue-50 hover:scale-110 active:scale-95 hover:bg-white"
         >
            <ChevronLeft size={28} strokeWidth={3} />
         </button>
         <div
            ref={containerRef}
            className={`flex overflow-x-auto no-scrollbar ${autoScroll ? '' : 'snap-x'} ${className} pb-4`}
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
         >
            {children}
         </div>
         <button 
           onClick={(e) => { e.preventDefault(); scrollBy(400); }} 
           className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 text-[#1877F2] shadow-xl p-3 rounded-full opacity-0 group-hover/nav:opacity-100 transition-all md:-mr-4 border border-blue-50 hover:scale-110 active:scale-95 hover:bg-white"
         >
            <ChevronRight size={28} strokeWidth={3} />
         </button>
      </div>
   );
};

export default function Home() {
   const [categories, setCategories] = useState<any[]>([]);
   const [products, setProducts] = useState<any[]>([]);
   const [banners, setBanners] = useState<any[]>([]);
   const [heroIndex, setHeroIndex] = useState(0);
   const [searchQuery, setSearchQuery] = useState("");
   const [settings, setSettings] = useState<any>(null);
   const router = useRouter();

   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

   useEffect(() => {
      fetch(`${API_URL}/categories`).then(res => res.json()).then(setCategories).catch(console.error);
      fetch(`${API_URL}/products`).then(res => res.json()).then(setProducts).catch(console.error);
      fetch(`${API_URL}/banners`).then(res => res.json()).then(b => setBanners(Array.isArray(b) ? b : [])).catch(console.error);
      fetch(`${API_URL}/settings`).then(res => res.json()).then(setSettings).catch(console.error);
   }, [API_URL]);

   useEffect(() => {
      if (banners.length <= 1) return;
      const timer = setInterval(() => {
         setHeroIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
   }, [banners]);

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      }
   };

   const safeCategories = Array.isArray(categories) ? categories : [];

   const getCategoriesByTag = (tagName: string) => {
      return safeCategories.filter((c: any) => c.isActive && c.tags?.toLowerCase().includes(tagName.toLowerCase()));
   };

   const CatalogSection = ({ title, tag, isAltBg }: { title: string, tag: string, isAltBg?: boolean }) => {
      const taggedCategories = getCategoriesByTag(tag);
      if (taggedCategories.length === 0) return null;

      const bgColor = isAltBg ? "bg-[#F7F4EF]" : "bg-[#FCF6EE]";

      return (
         <section className={`${bgColor} py-7 px-4 md:px-8 border-b border-[#F0E6D8]`}>
            <div className="max-w-[1400px] mx-auto text-center">
               <div className="flex items-center justify-center relative mb-10 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-[#4B3B2B] tracking-widest uppercase pb-2 inline-block">
                     {title}
                  </h2>
                  <Link href={`/shop?category=${tag}`} className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-blue-100 hover:border-blue-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center">
                  {taggedCategories.map((item: any) => {
                      const isCustom = item.slug.includes('acrylic') || item.name.toLowerCase().includes('acrylic') || item.name.toLowerCase().includes('lamp') || item.name.toLowerCase().includes('clock') || item.name.toLowerCase().includes('gallery');
                      const href = isCustom ? `/studio-v2?category=${item.slug}` : `/shop?category=${item.slug}`;

                     return (
                        <Link key={item.id} href={href} className="flex flex-col items-center group text-center hover:-translate-y-1 transition-all">
                           <div className="w-full aspect-square overflow-hidden mb-4 rounded-[16px] shadow-sm relative">
                              <img
                                 src={resolveMedia(item.image, API_URL)}
                                 alt={item.name}
                                 loading="lazy"
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                           </div>
                           <h3 className="text-sm font-bold text-gray-800 transition-colors leading-tight px-2">
                              {item.name}
                           </h3>
                        </Link>
                     );
                  })}
               </div>
            </div>
         </section>
      );
   };

   return (
      <div className="bg-white min-h-screen">

         {/* MEGA HEADER SECTION: Products Perfectly Personalized For You + Pill Search */}
         <section className="pt-6 pb-8 bg-white border-b border-blue-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
               <h2 className="text-2xl md:text-4xl font-bold text-[#1877F2] mb-6 leading-tight tracking-tight">
                  Products, Perfectly Personalized For You
               </h2>
               <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                  <div className="relative flex items-center">
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for Hearts Effect Photo Frames, Logo Badges etc."
                        className="w-full h-12 pl-8 pr-12 rounded-full border border-blue-100/50 bg-[#EAF3FE]/80 text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all placeholder:text-slate-400 font-sans shadow-sm"
                     />
                     <div className="absolute right-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Search size={18} strokeWidth={2.5} />
                     </div>
                     <button type="submit" className="hidden">Search</button>
                  </div>
               </form>
               <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['Acrylic Prints', 'Custom Cases', 'Wall Art'].map(tag => (
                     <button key={tag} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        {tag}
                     </button>
                  ))}
               </div>
            </div>
         </section>

         {/* MAIN CATEGORIES (POPULAR PRODUCTS) - Seamless Slow Marquee */}
         <section className="bg-[#FCF6EE] py-7 px-0 border-y border-[#F0E6D8] overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-2 relative flex flex-col md:flex-row items-center justify-center">
               <h2 className="text-xl md:text-[22px] font-bold text-[#4B3B2B] tracking-widest uppercase mb-4 md:mb-8 pb-3 inline-block relative">
                  POPULAR PRODUCTS
               </h2>
               <Link href="/shop" className="md:absolute right-4 md:right-8 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest mb-4 md:mb-8 hover:text-[#4B3B2B] transition-colors rounded border border-blue-100 hover:border-blue-300 px-3 py-1">
                  View All &gt;
               </Link>
            </div>

            <div className="flex relative w-full group pt-2 pb-6">
               <DragScroll className="w-full" autoScroll={true}>
                  <div className="flex gap-6 px-4 md:px-8 items-stretch w-max mx-auto md:mx-0">
                     {safeCategories.filter(c => !c.parentId && c.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)).map((item: any) => {
                        const isCustom = item.slug.includes('acrylic') || item.name.toLowerCase().includes('acrylic') || item.name.toLowerCase().includes('lamp') || item.name.toLowerCase().includes('clock') || item.name.toLowerCase().includes('gallery');
                        const href = isCustom ? `/studio-v2?category=${item.slug}` : `/shop?category=${item.slug}`;

                        return (
                           <Link key={`pop-${item.id}`} href={href} className="flex flex-col items-center w-[160px] md:w-[190px] transition-all flex-shrink-0 hover:-translate-y-1 focus:outline-none snap-start">
                              <div className="w-full aspect-square overflow-hidden mb-3 rounded-[16px] shadow-sm group-hover:shadow-md transition-shadow">
                                 {item.image ? (
                                    <img
                                       src={resolveMedia(item.image, API_URL)}
                                       alt={item.name}
                                       draggable={false}
                                       loading="lazy"
                                       className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                 ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-black text-4xl uppercase tracking-widest bg-gradient-to-br from-slate-50 to-slate-200">
                                       {item.name?.slice(0, 2)}
                                    </div>
                                 )}
                              </div>
                              <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800 transition-colors whitespace-normal text-center min-h-[40px] px-2 flex items-start justify-center capitalize">
                                 {item.name}
                              </h3>
                           </Link>
                        );
                     })}
                  </div>
               </DragScroll>
            </div>
         </section>

         {/* NEW ARRIVALS: Latest 5 Categories + Latest 5 Products */}
         <section className="bg-[#F7F4EF] py-7 px-4 md:px-8 border-b border-[#F0E6D8] overflow-hidden">
               <div className="flex items-center justify-center relative mb-8 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-[#4B3B2B] tracking-widest uppercase pb-3 inline-block relative">
                     NEW ARRIVALS
                  </h2>
                  <Link href="/shop" className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-blue-100 hover:border-blue-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto justify-center pb-6">
               {(() => {
                  const combined = [
                     ...safeCategories.filter(c => c.isActive).map(c => ({ ...c, _itemType: 'category' })),
                     ...(Array.isArray(products) ? products : []).filter(p => p.status === 'PUBLISHED').map(p => ({ ...p, _itemType: 'product' }))
                  ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

                  return combined.map((item: any) => {
                     if (item._itemType === 'category') {
                        const isCustom = item.slug.includes('acrylic') || item.name.toLowerCase().includes('acrylic') || item.name.toLowerCase().includes('lamp') || item.name.toLowerCase().includes('clock') || item.name.toLowerCase().includes('gallery');
                        const href = isCustom ? `/studio-v2?category=${item.slug}` : `/shop?category=${item.slug}`;
                        return (
                           <Link key={`new-cat-${item.id}`} href={href} className="flex flex-col items-center group text-center hover:-translate-y-1 transition-all">
                              <div className="w-full aspect-square overflow-hidden mb-4 shadow-sm rounded-[16px] relative">
                                 <div className="absolute top-2 right-2 bg-[#E3323A] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10 tracking-widest uppercase">New Category</div>
                                 {item.image ? (
                                    <img src={resolveMedia(item.image, API_URL)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                 ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-black text-4xl uppercase tracking-widest bg-gradient-to-br from-slate-50 to-slate-200">
                                       {item.name?.slice(0, 2)}
                                    </div>
                                 )}
                              </div>
                              <h3 className="text-[13px] md:text-sm font-bold text-gray-800 transition-colors leading-tight px-2 capitalize">
                                 {item.name}
                              </h3>
                           </Link>
                        );
                     } else {
                        return (
                           <Link key={`new-prod-${item.id}`} href={`/shop`} className="flex flex-col items-center group text-center hover:-translate-y-1 transition-all">
                              <div className="w-full aspect-square overflow-hidden mb-4 shadow-sm rounded-[16px] relative">
                                 <div className="absolute top-2 left-2 bg-[#4B3B2B] text-white text-[9px] font-bold px-2 py-0.5 rounded z-10 tracking-widest uppercase">Latest Item</div>
                                 <img src={resolveMedia(item.images?.[0] || item.previewImage, API_URL)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              <h3 className="text-[13px] md:text-sm font-bold text-gray-800 transition-colors leading-tight px-2 line-clamp-1 capitalize">
                                 {item.name}
                              </h3>
                              <p className="text-[#E3323A] font-bold text-xs mt-1 tracking-widest">₹{item.price || item.basePrice}</p>
                           </Link>
                        );
                     }
                  });
               })()}
            </div>
         </section>

         {/* TAG BASED SECTIONS mimicking the Printshoppy layout */}
         <CatalogSection title="WALL DECORATIVES" tag="Wall Decoratives" />
         <CatalogSection title="DESK DECORATIVES" tag="Desk Decoratives" isAltBg={true} />

         {/* CUSTOM TAG SECTION: HOME DECORATIVES (MATCHING ATTACHMENT) */}
         <section className="bg-indigo-50/20 py-8 px-4 md:px-8 border-b border-indigo-100/50">
            <div className="max-w-[1400px] mx-auto text-center">
               <div className="flex items-center justify-center relative mb-6 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-[#2D3A82] tracking-widest uppercase pb-2 inline-block relative font-sans">
                     HOME DECORATIVES
                  </h2>
                  <Link href="/shop?category=home-decor" className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-blue-100/50 hover:border-blue-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 justify-center">
                  {[
                     { name: 'Kitchen Identifiers', oldPrice: 699, price: 499, soldOut: true, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600' },
                     { name: 'Switch Stickers', oldPrice: 499, price: 299, soldOut: true, image: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=600' },
                     { name: 'Photo Charging Holders', oldPrice: 499, price: 299, soldOut: false, image: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&q=80&w=600' },
                     { name: 'Photo Lamps', oldPrice: 499, price: 299, soldOut: false, image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=600' },
                     { name: 'Fridge Magnets', oldPrice: null, price: 149, soldOut: false, suffix: 'Each*', image: 'https://images.unsplash.com/photo-1583945321524-70498a54ede8?auto=format&fit=crop&q=80&w=600' },
                     { name: 'Luggage Tag', oldPrice: 399, price: 249, soldOut: false, image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center group transition-all hover:-translate-y-1">
                       <div className="w-full aspect-square relative overflow-hidden rounded-[20px] shadow-sm border border-slate-200 bg-white mb-3">
                          {item.soldOut && (
                             <div className="absolute top-3 -right-8 bg-[#E3323A] text-white text-[8px] font-bold py-1 px-8 rotate-45 z-20 shadow-sm tracking-widest uppercase">
                                SOLD OUT
                             </div>
                          )}
                          <img src={item.image} alt={item.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${item.soldOut ? 'grayscale-[0.5]' : ''}`} />
                       </div>
                       <div className="flex flex-col items-center px-2">
                          <h3 className="text-[13px] md:text-sm font-bold text-slate-800 leading-tight mb-1.5 text-center items-start justify-center capitalize">{item.name}</h3>
                          <div className="flex items-center gap-1.5">
                             {item.oldPrice && <span className="text-[10px] text-slate-400 line-through font-bold">₹{item.oldPrice}/-</span>}
                             <span className="text-[12px] font-black text-[#2D3A82]">
                                {item.oldPrice === null ? 'From ' : ''}₹{item.price}/-
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </section>

         {/* CUSTOM TAG SECTION: KIDS ZONE (MATCHING ATTACHMENT) */}
         <section className="bg-[#FFF9EA] py-10 px-4 md:px-8 border-b border-amber-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/20 rounded-full -mr-40 -mt-40 blur-3xl"></div>
            <div className="max-w-[1400px] mx-auto text-center relative z-10">
               <div className="flex items-center justify-center relative mb-8 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-[#1a1a1a] tracking-widest uppercase pb-3 inline-block relative font-sans">
                     KIDS ZONE
                  </h2>
                  <Link href="/shop?category=kids-zone" className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-amber-100 hover:border-amber-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center">
                  {[
                     {
                        name: 'Acrylic Writing Pads',
                        oldPrice: 1699,
                        price: 799,
                        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600'
                     },
                     {
                        name: 'Name Pencils',
                        oldPrice: null,
                        price: 149,
                        suffix: 'Each Pack*',
                        image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=600'
                     }
                  ].map((item, i) => (
                     <div key={i} className="flex flex-col items-center group transition-all hover:-translate-y-1">
                        <div className="w-full aspect-square relative overflow-hidden rounded-[20px] shadow-md border-2 border-white mb-3">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="flex flex-col items-center px-2">
                           <h3 className="text-[13px] md:text-sm font-bold text-slate-900 leading-tight mb-1.5 text-center items-start justify-center capitalize">{item.name}</h3>
                           <div className="flex items-center gap-1.5">
                              {item.oldPrice && <span className="text-[10px] text-slate-400 line-through font-bold">₹{item.oldPrice}/-</span>}
                              <span className="text-[12px] font-black text-[#1877F2]">
                                 {item.oldPrice === null ? 'From ' : ''}₹{item.price}/-
                              </span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* CUSTOM TAG SECTION: MOBILE ACCESSORIES (MATCHING ATTACHMENT) */}
         <section className="bg-slate-50/50 py-8 px-4 md:px-8 border-b border-slate-100">
            <div className="max-w-[1400px] mx-auto text-center">
               <div className="flex items-center justify-center relative mb-8 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-slate-900 tracking-widest uppercase mb-1.5 font-sans">
                     MOBILE ACCESSORIES
                  </h2>
                  <Link href="/shop?category=mobile-accessories" className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-slate-100 hover:border-slate-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Premium Protection & Style</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <Link href="/shop?category=mobile-cases" className="flex flex-col items-center group">
                     <div className="w-full aspect-[21/9] bg-white rounded-2xl overflow-hidden shadow-sm relative border border-slate-100">
                        <img 
                           src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1200" 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                           alt="Mobile Cases" 
                        />
                     </div>
                     <div className="mt-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1 capitalize">Personalized Mobile Cases</h3>
                        <p className="text-blue-600 font-black text-[10px] tracking-widest uppercase">From ₹299/-</p>
                     </div>
                  </Link>
 
                  <Link href="/shop?category=phone-stands" className="flex flex-col items-center group">
                     <div className="w-full aspect-[21/9] bg-white rounded-2xl overflow-hidden shadow-sm relative border border-slate-100">
                        <img 
                           src="https://images.unsplash.com/photo-1586940882873-41f237ef8052?auto=format&fit=crop&q=80&w=1200" 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                           alt="Phone Stands" 
                        />
                     </div>
                     <div className="mt-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1 capitalize">Durable Phone Stands</h3>
                        <p className="text-blue-600 font-black text-[10px] tracking-widest uppercase">From ₹299/-</p>
                     </div>
                  </Link>
               </div>
            </div>
         </section>

         {/* CUSTOM TAG SECTION: OFFICE & BUSINESS NEEDS (MATCHING ATTACHMENT) */}
         <section className="bg-blue-50/30 py-8 px-4 md:px-8 border-b border-blue-100/50">
            <div className="max-w-[1400px] mx-auto text-center">
               <div className="flex items-center justify-center relative mb-1.5 group/header">
                  <h2 className="text-xl md:text-[22px] font-bold text-slate-900 tracking-widest uppercase font-sans">
                     OFFICE ACCESSORIES
                  </h2>
                  <Link href="/shop?category=office-accessories" className="absolute right-0 text-[11px] font-bold text-[#1877F2] hover:underline uppercase tracking-widest hover:text-[#4B3B2B] transition-colors rounded border border-blue-100 hover:border-blue-300 px-3 py-1">
                     View All &gt;
                  </Link>
               </div>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Professional Branding Solutions</p>
               
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                  {[
                    { name: 'Custom Trophies', price: 499, image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Office Notebooks', price: 199, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Office Bottles', price: 399, image: 'https://images.unsplash.com/photo-1610719064611-15c39dc2e19a?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Letterheads', price: 600, image: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Desk Calendars', price: 299, image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600' }
                  ].map((item, i) => (
                    <Link key={i} href="/shop" className="group flex flex-col items-center">
                       <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white mb-3 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                       </div>
                       <h3 className="text-[13px] font-bold text-slate-800 mb-1 active:text-blue-600 transition-colors capitalize">{item.name}</h3>
                       <p className="text-blue-600 font-black text-[10px] tracking-widest uppercase">From ₹{item.price}/-</p>
                    </Link>
                  ))}
               </div>
            </div>
         </section>

         <CatalogSection title="PHOTO ALBUMS & PRINTS" tag="Photo Albums" />
         <CatalogSection title="HOME DECORATIVES" tag="Home Decoratives" isAltBg={true} />

         {/* BOUTIQUE VISION & TRUST SECTION (MATCHING ATTACHMENT) */}
         <section className="bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto space-y-8">

               {/* VISION AND STATS CARD */}
               <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row p-6 md:p-10 gap-8 md:gap-12">
                  <div className="lg:w-1/2 flex flex-col justify-center">
                     <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-6 font-sans">OUR VISION</h3>
                     <p className="text-slate-500 font-medium leading-relaxed mb-6">
                        In line with our vision, we wish to be recognized as an organization renowned for its creative solutions, innovation, and quality.
                        We also aim to re-calibrate the benchmark standards in designing and printing products tailored to meet the needs of a diverse customer base.
                     </p>
                  </div>

                  <div className="lg:w-1/2 bg-[#0B1E40] rounded-2xl relative p-8 text-white overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>

                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 flex-shrink-0">
                           <svg viewBox="0 0 24 24" fill="#FBBF24" className="w-full h-full opacity-80"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight font-sans">WE ARE <span className="text-yellow-400">HOMEGROWN.</span></h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10 border-b border-white/10 pb-10">
                        {[
                           'Printing your memories since 2015',
                           'Guaranteed high quality products',
                           'Everything is personalised',
                           'Free delivery All Over India'
                        ].map((li, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                              <span className="text-sm font-bold opacity-80 uppercase tracking-wide">{li}</span>
                           </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-2 xl:grid-cols-4 gap-8">
                        {[
                           { val: '10 Lakh +', label: 'Happy Customers' },
                           { val: '1005 +', label: 'Google Reviews' },
                           { val: '1 Lakh +', label: 'Products Delivered' },
                           { val: '800 +', label: '5-Star Ratings' }
                        ].map((stat, idx) => (
                           <div key={idx} className="flex flex-col">
                              <span className="text-xl font-black text-white mb-1">{stat.val}</span>
                              <span className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-tight">{stat.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* BULK ORDERS CONTACT CARD */}
               <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 mb-2 font-sans">Need Bulk Quantities?</h3>
                     <p className="text-slate-400 font-bold text-sm tracking-tight opacity-80">
                        We've got you covered! Enjoy competitive pricing and fast delivery on all your bulk orders.
                     </p>
                  </div>
                  <a href={`https://wa.me/${settings?.whatsappNumber || '919900000000'}`} className="flex items-center gap-3 bg-[#0F8CFF] hover:bg-[#0070E0] text-white px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 flex-shrink-0 group">
                     <MessageSquare size={20} fill="white" className="group-hover:rotate-12 transition-transform" />
                     <span className="text-sm font-black uppercase tracking-[0.1em] font-sans">Contact Us</span>
                  </a>
               </div>

            </div>
         </section>


      </div>
   );
}
