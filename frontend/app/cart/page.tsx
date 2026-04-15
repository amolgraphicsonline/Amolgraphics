"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ChevronLeft,
  ShieldCheck, Truck, CreditCard, RotateCcw, X, Save, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, total, cartItemsCount, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');

  const resolve = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  // Mock cashback calculation (10% of total)
  const cashback = Math.floor(total * 0.1);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#f8fafc] flex flex-col items-center justify-center text-center p-8 border-t border-gray-100 font-sans">
        <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-xl border border-blue-50">
           <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">Your cart is silent</h1>
        <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">It seems you haven't added any personalized creations yet.</p>
        <Link 
          href="/studio-v2?category=photo-gallery" 
          className="px-12 py-4 bg-[#1877F2] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
        >
          Start Customizing
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 pb-32 font-sans overflow-x-hidden">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* CASHBACK PROMO BAR */}
        <div className="mb-8 bg-white border border-blue-100 rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-[0_10px_40px_-10px_rgba(24,119,242,0.1)] relative overflow-hidden group">
           <div className="relative z-10">
              <h2 className="text-lg md:text-xl font-black text-[#1877F2] tracking-tight mb-2">
                Cashback on this order is ₹{cashback}.
              </h2>
              <p className="text-[12px] font-medium text-slate-400">
                (Cashback will be added to your Amol Graphics wallet within 24 hours of order delivery.)
              </p>
           </div>
           <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1877F2] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative z-10 transition-transform group-hover:rotate-12 duration-500">
              <RefreshCw className="w-8 h-8 md:w-10 md:h-10" />
           </div>
           {/* Abstract background blobs */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: PRODUCT CARDS */}
          <div className="lg:col-span-8 space-y-8">
             {cart.map((item) => {
                let designData: any = {};
                try { designData = JSON.parse(item.designJson || '{}'); } catch(e) {}
                
                return (
                  <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="p-6 md:p-8 flex flex-col md:flex-row gap-10">
                        {/* PRODUCT PREVIEW - Increased padding to show canvas clearly */}
                        <div className="w-full md:w-56 aspect-square rounded-[3rem] bg-slate-100/80 border border-slate-200/50 overflow-hidden shrink-0 flex items-center justify-center relative p-8 group shadow-inner">
                           {/* The "Acrylic/Book" Preview Piece */}
                           <div className="absolute inset-8 bg-white shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                              style={{ 
                                 clipPath: designData.shape?.toLowerCase().includes('heart') ? 'url(#heart-clip)' : (designData.shape?.toLowerCase().includes('hex') ? 'url(#hexagon-clip)' : (designData.shape?.toLowerCase().includes('circle') ? 'circle(50% at 50% 50%)' : 'none')),
                                 filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.12))'
                              }}
                           >
                              <img 
                                 src={resolve(designData.designImage || item.image)} 
                                 alt={item.name} 
                                 className="w-full h-full object-cover" 
                              />
                              {(designData.designImage && item.image) && (
                                 <div className="absolute bottom-2 right-2 w-12 h-12 rounded-lg border-2 border-white shadow-lg overflow-hidden">
                                    <img src={resolve(item.image)} className="w-full h-full object-cover" />
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* PRODUCT SPECS */}
                        <div className="flex-1 space-y-8 pt-2">
                           <div className="relative">
                              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-tight mb-1">
                                 {designData.categoryDisplayName || item.name}
                              </h3>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                 {designData.designName || item.variantName || 'Custom Personalized Product'}
                              </p>
                              
                              <div className="mt-3 flex items-center gap-3">
                                 <p className="text-xl font-black text-slate-900 leading-none">₹{item.price}</p>
                                 <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-[11px] text-slate-300 line-through">₹{Math.floor(item.price * 1.5)}</span>
                                    <span className="text-[10px] text-[#1caf9c] bg-[#e7f5f9] px-2 py-0.5 rounded uppercase tracking-wider">(You Saved: ₹{Math.floor(item.price * 0.5)})</span>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 border-t border-slate-50 pt-6">
                              {/* 1. SIZE (Always show if exists) */}
                              {(item.size || designData.size?.label) && (
                                 <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIZE :</span>
                                    <span className="text-[11px] font-black text-[#1877F2] uppercase">{item.size || designData.size?.label}</span>
                                 </div>
                              )}

                              {/* 2. THEME / SHAPE */}
                              {(designData.shape || item.variantName) && (
                                 <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">THEME :</span>
                                    <span className="text-[11px] font-black text-[#1877F2] uppercase">{designData.shape || item.variantName}</span>
                                 </div>
                              )}

                              {/* 3. BORDER (Show only if not none) */}
                              {designData.border && designData.border !== 'none' && (
                                 <div className="flex justify-between items-center bg-slate-50/50 px-4 py-2 rounded-xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BORDER :</span>
                                    <span className="text-[11px] font-black text-[#1877F2] uppercase">
                                       {(() => {
                                          const b = (designData.border || 'None').toUpperCase();
                                          if (b === '#FFFFFF') return 'WHITE';
                                          if (b === '#000000') return 'BLACK';
                                          if (b === '#EF4444') return 'RED';
                                          if (b === '#1877F2') return 'BLUE';
                                          if (b === '#FFD700') return 'YELLOW';
                                          if (b === '#1CAF9C') return 'GREEN';
                                          return b;
                                       })()}
                                    </span>
                                 </div>
                               )}

                                {/* 4. PAGES / IMAGES */}
                                {(designData.frameCount || Object.keys(designData.photos || {}).length > 0) && (
                                 <div className="flex justify-between items-center bg-[#f0f9ff] px-4 py-2 rounded-xl border border-blue-100">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">CONTENT :</span>
                                    <span className="text-[11px] font-black text-[#1877F2] uppercase">
                                      {designData.frameCount || Object.keys(designData.photos || {}).length} IMAGES
                                    </span>
                                 </div>
                               )}
                           </div>

                           {/* 5. DESIGN IDENTIFIER */}
                           {designData.designId && (
                              <div className="mt-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 italic">
                                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">DESIGN ID:</span>
                                 <span className="text-[10px] font-bold text-slate-500">{designData.designId} - {designData.designName || 'Selected Layout'}</span>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* CARD ACTIONS */}
                     <div className="bg-slate-50/50 border-t border-slate-50 px-8 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                           <button 
                              onClick={() => removeFromCart(item.id)}
                              className="group flex items-center gap-2.5 text-rose-500 hover:text-rose-600 transition-all font-black text-[10px] uppercase tracking-widest"
                           >
                              <div className="p-2 bg-rose-50 rounded-lg group-hover:scale-110 transition-transform">
                                 <Trash2 className="w-4 h-4" />
                              </div>
                              Remove Product
                           </button>
                           <button className="group flex items-center gap-2.5 text-slate-400 hover:text-[#1877F2] transition-all font-black text-[10px] uppercase tracking-widest">
                              <div className="p-2 bg-slate-100/50 rounded-lg group-hover:scale-110 transition-transform">
                                 <Save className="w-4 h-4" />
                              </div>
                              Save For Later
                           </button>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white/50 p-1 rounded-xl border border-slate-100">
                           <button 
                             onClick={() => updateQuantity(item.id, item.quantity - 1)}
                             className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#1877F2] hover:bg-slate-50 rounded-lg transition-all active:scale-95 shadow-sm"
                           >
                              <Minus size={14} />
                           </button>
                           <span className="w-8 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                           <button 
                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
                             className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-[#1877F2] hover:bg-slate-50 rounded-lg transition-all active:scale-95 shadow-sm"
                           >
                              <Plus size={14} />
                           </button>
                        </div>
                     </div>
                  </div>
                );
             })}

             {/* BACK NAVIGATION */}
             <div className="pt-4">
                <Link href="/studio-v2?category=photo-gallery" className="inline-flex items-center gap-3 text-slate-400 hover:text-[#1877F2] font-black text-[10px] uppercase tracking-widest group transition-all">
                   <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:-translate-x-1 transition-transform">
                      <ChevronLeft size={16} />
                   </div>
                   Continue personalizing
                </Link>
             </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-[0_25px_80px_rgba(0,0,0,0.06)] space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                <h2 className="text-3xl font-black text-[#1caf9c] tracking-tighter uppercase mb-6 leading-none">Order Summary</h2>
                
                <div className="space-y-4 font-bold uppercase text-[12px] tracking-wide">
                   <div className="flex justify-between items-center text-slate-500">
                      <span className="font-medium text-slate-400">Sub-Total</span>
                      <span className="text-slate-700">₹{Math.floor(total * 1.5)}</span>
                   </div>
                   {cart.map(item => (
                       <div key={item.id} className="flex justify-between items-center text-[#1caf9c]">
                         <span className="font-bold opacity-80 italic">Discount Applied</span>
                         <span className="font-black tracking-tight">₹-{Math.floor(item.price * item.quantity * 0.5)}</span>
                      </div>
                   ))}
                   <div className="flex justify-between items-center text-slate-500">
                      <span className="font-medium text-slate-400">Shipping Charges</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 line-through">₹100</span>
                        <span className="text-[#1caf9c]">Free</span>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <div className="flex justify-between items-end mb-6">
                      <p className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Total</p>
                      <p className="text-5xl font-black text-slate-900 leading-none">
                         <span className="text-2xl align-top mr-1">₹</span>{total}
                      </p>
                   </div>
                   
                   <button 
                     onClick={() => router.push('/checkout')}
                     className="w-full h-20 bg-[#1877F2] hover:bg-blue-600 text-white font-black rounded-3xl text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 group mb-8"
                   >
                      Place Order ({cartItemsCount} items)
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>

                   {/* NO EXTRA CHARGES BADGE */}
                   <div className="bg-[#e7f5f9] border border-blue-50 rounded-2xl p-5 flex items-center gap-5 group hover:bg-blue-100/50 transition-colors">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#1877F2] shadow-xl shadow-blue-500/10 group-hover:rotate-[360deg] duration-1000">
                         <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                         <p className="text-[11px] font-black text-[#1877F2] uppercase tracking-[0.1em] mb-0.5">No Extra Charges</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pay only the product price</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* TRUST MARKS */}
             <div className="mt-8 px-10 flex justify-between text-slate-300">
                <Truck className="w-6 h-6 opacity-30" />
                <CreditCard className="w-6 h-6 opacity-30" />
                <RotateCcw className="w-6 h-6 opacity-30" />
             </div>
          </div>
        </div>
      </div>

      <svg width="0" height="0" className="absolute pointer-events-none opacity-0">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 1 C 0.5 1 0 0.7 0 0.35 C 0 0.15 0.15 0 0.35 0 C 0.45 0 0.5 0.1 0.5 0.2 C 0.5 0.1 0.55 0 0.65 0 C 0.85 0 1 0.15 1 0.35 C 1 0.7 0.5 1 0.5 1" />
          </clipPath>
          <clipPath id="hexagon-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.25 0 L 0.75 0 L 1 0.5 L 0.75 1 L 0.25 1 L 0 0.5 Z" />
          </clipPath>
          <clipPath id="circle-clip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
