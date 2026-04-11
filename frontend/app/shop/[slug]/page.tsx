"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShoppingBag, Heart, Share2, Check, Star, 
  ArrowLeft, Truck, ShieldCheck, RotateCcw,
  ChevronRight, Plus, Minus, Sparkles
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const resolveMedia = (path: string, apiUrl: string) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith('http')) return path;
  const baseUrl = apiUrl.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`${API_URL}/products/slug/${slug}`)
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Server responded with ${res.status}: ${text.substring(0, 100)}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server did not return JSON");
          }
          return res.json();
        })
        .then(data => {
          setProduct(data);
          setActiveImage(data.mainImage);
          if (data.variants && data.variants.length > 0) {
            const def = data.variants.find((v: any) => v.isDefault) || data.variants[0];
            setSelectedVariant(def);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch accurate product failed:", err);
          setProduct(null);
          setLoading(false);
        });
    }
  }, [slug, API_URL]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
       <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
       <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Product not found</h1>
       <Link href="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all">BACK TO HOME</Link>
    </div>
  );

  const gallery = product.images ? JSON.parse(product.images) : [];
  const allImages = [product.mainImage, ...gallery].filter(Boolean);

  const finalPrice = selectedVariant ? 
    (selectedVariant.salePrice || selectedVariant.price) : 
    (product.salePrice || product.regularPrice || 0);
  
  const originalPrice = selectedVariant ? 
    selectedVariant.price : 
    (product.regularPrice || finalPrice);

  const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariant?.id || product.id,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: resolveMedia(selectedVariant?.variantImage || product.mainImage, API_URL),
      quantity: quantity,
      variantName: selectedVariant ? 
        selectedVariant.variantAttributes?.map((a: any) => a.attributeValue).join(" / ") : 
        ""
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
         <nav className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-blue-600 transition-all">HOME</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-blue-600 transition-all">SHOP</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">{product.name}</span>
         </nav>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* LEFT SIDE: Gallery */}
            <div className="space-y-6">
               <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border border-slate-100 shadow-2xl group">
                  <img 
                    src={resolveMedia(activeImage, API_URL)} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <div className="absolute top-8 left-8 bg-[#FF5A5F] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20">
                      {discount}% OFF
                    </div>
                  )}
                  <button className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-xl active:scale-95">
                    <Heart className="w-5 h-5" />
                  </button>
               </div>

               {allImages.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === img ? 'border-blue-600 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                         <img src={resolveMedia(img, API_URL)} className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
               )}
            </div>

            {/* RIGHT SIDE: Info */}
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="inline-flex px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-100">
                     {(
                        (product.name?.toLowerCase().includes("custom") || 
                         product.name?.toLowerCase().includes("personalised") || 
                         product.name?.toLowerCase().includes("personalized") ||
                         product.name?.toLowerCase().includes("your photo")) || 
                        (product.category?.name?.toLowerCase().includes("clocks"))
                     ) ? 'Bespoke Craft · Studio Edition' 
                       : 'Ready to Use · Premium Atelier'}
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">{product.name}</h1>
                  <div className="flex items-center gap-6">
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">48 Verified Reviews</span>
                  </div>
               </div>

               <div className="space-y-1">
                  <div className="flex items-baseline gap-4">
                     <span className="text-5xl font-black text-blue-600 tracking-tighter">₹{finalPrice.toLocaleString()}</span>
                     {discount > 0 && (
                       <span className="text-xl font-bold text-slate-300 line-through tracking-tight italic">₹{originalPrice.toLocaleString()}</span>
                     )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusive of all taxes (GST) & free delivery</p>
               </div>

               {/* Variations */}
               {product.variants && product.variants.length > 0 && (
                 <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Select Variant</h4>
                    <div className="flex flex-wrap gap-3">
                       {product.variants.map((v: any, idx: number) => (
                         <button 
                           key={idx}
                           onClick={() => {
                             setSelectedVariant(v);
                             if (v.variantImage) setActiveImage(v.variantImage);
                           }}
                           className={`px-6 py-3 rounded-2xl border-2 text-[10px] font-black transition-all ${selectedVariant?.id === v.id ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/10' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                         >
                            {v.variantAttributes?.map((a: any) => a.attributeValue).join(" / ") || `Option ${idx + 1}`}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               <div className="space-y-8 pt-8 border-t border-slate-100">
             <div className="flex flex-col sm:flex-row items-center gap-6">
                {(
                  ((product.name?.toLowerCase().includes("custom") || 
                    product.name?.toLowerCase().includes("personalised") || 
                    product.name?.toLowerCase().includes("personalized") ||
                    product.name?.toLowerCase().includes("your photo")) || 
                   (product.category?.name?.toLowerCase().includes("clocks"))) &&
                  !product.name?.toLowerCase().includes("ready made")
                ) ? (
                  <Link 
                    href={`/studio-v2?productId=${product.id}&category=${product.category?.slug || (product.category?.name?.toLowerCase().includes("clocks") ? 'clocks' : 'acrylic')}`}
                    className="flex-1 flex items-center justify-center gap-4 py-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 group"
                  >
                     <Sparkles className="w-5 h-5 text-blue-200 animate-pulse" />
                     PERSONALIZE & DESIGN
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                     <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all"
                        >
                           <Minus className="w-4 h-4 text-slate-400" />
                        </button>
                        <span className="w-12 text-center font-black text-sm text-slate-900">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all"
                        >
                           <Plus className="w-4 h-4 text-slate-400" />
                        </button>
                     </div>
                     <button 
                       onClick={handleAddToCart}
                       className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${isAdded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#002366] text-white shadow-blue-900/40 hover:bg-slate-900 active:scale-95'}`}
                     >
                        {isAdded ? (
                          <>
                            <Check className="w-5 h-5" />
                            ADDED TO CART
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-5 h-5" />
                            SECURE ADD TO CART
                          </>
                        )}
                     </button>
                  </>
                )}
             </div>

                  {/* Trust Features */}
                  <div className="grid grid-cols-3 gap-4">
                     {[
                        { icon: <Truck className="w-5 h-5" />, text: "Free Dispatch" },
                        { icon: <ShieldCheck className="w-5 h-5" />, text: "Genuine Quality" },
                        { icon: <RotateCcw className="w-5 h-5" />, text: "Easy Returns" }
                     ].map((item, i) => (
                       <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-slate-50 bg-slate-50/30">
                          <div className="text-blue-600">{item.icon}</div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.text}</span>
                       </div>
                     ))}
                  </div>

                  <div className="space-y-4 pt-4">
                     <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        Product Description
                     </div>
                     <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                        {product.description || "Indulge in our masterfully crafted pieces that represent the pinnacle of global artistry. Each product is meticulously inspected by our studio experts."}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
