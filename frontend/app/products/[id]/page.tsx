"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw, Loader2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL.replace("/api", "")}${path}`;
}

export default function ReadyToSaleProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        // Default to first variant
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fcfcfd]">
      <Package className="w-16 h-16 text-slate-200" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Product not found</p>
      <Link href="/shop" className="text-orange-500 text-xs font-black uppercase tracking-widest hover:underline">← Back to Shop</Link>
    </div>
  );

  const images: string[] = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(() => { try { return JSON.parse(product.images || "[]"); } catch { return []; } })()
  ].filter(Boolean);

  const displayPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.regularPrice || 0;
  const originalPrice = selectedVariant?.price || product.regularPrice || 0;

  const handleAddToCart = () => {
    const sizeAttr = selectedVariant?.variantAttributes?.find((a: any) =>
      a.attributeName.toLowerCase().includes("size")
    );
    addToCart({
      id: `rts-${Date.now()}-${product.id}`,
      productId: product.id,
      name: product.name,
      price: displayPrice * quantity,
      image: resolveUrl(images[0] || ""),
      quantity,
      size: sizeAttr?.attributeValue || selectedVariant?.sku || "Standard",
      variantName: selectedVariant?.variantAttributes?.map((a: any) => a.attributeValue).join(" / ") || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-xs font-black uppercase tracking-widest">
          <ChevronLeft size={16} /> Back
        </button>
        <Link href="/shop" className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Shop</Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative group">
              {images.length > 0 ? (
                <img src={resolveUrl(images[selectedImage])} className="w-full h-full object-contain p-8 transition-all duration-500" alt={product.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <Package className="w-24 h-24" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(i => Math.max(0, i - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${selectedImage === i ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-slate-100 hover:border-slate-300'}`}>
                    <img src={resolveUrl(img)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Ready to Ship</span>
            </div>

            <div className="space-y-3">
              {product.category && <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{product.category.name}</p>}
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h1>
              {product.shortDescription && <p className="text-slate-500 text-sm leading-relaxed">{product.shortDescription}</p>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-slate-900">₹{displayPrice}</span>
              {originalPrice > displayPrice && (
                <span className="text-xl font-medium text-slate-300 line-through">₹{originalPrice}</span>
              )}
              {originalPrice > displayPrice && (
                <span className="px-3 py-1 bg-[#ff3f6c]/10 text-[#ff3f6c] text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {Math.round((1 - displayPrice / originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Variant / Size Selector */}
            {product.variants?.length > 1 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => {
                    const label = v.variantAttributes?.map((a: any) => a.attributeValue).join(" / ") || v.sku || `Option ${v.id.slice(-4)}`;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 text-[11px] font-black uppercase tracking-wide transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {label}
                        {(v.salePrice || v.price) && <span className="ml-2 text-slate-400 font-medium">₹{v.salePrice || v.price}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all font-black text-lg">–</button>
                <span className="text-xl font-black text-slate-900 w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all font-black text-lg">+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-slate-900 text-white hover:bg-orange-500 shadow-slate-900/20 hover:shadow-orange-500/30'
              }`}
            >
              <ShoppingCart size={18} />
              {added ? '✓ Added to Cart!' : `Add to Cart — ₹${displayPrice * quantity}`}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {[
                { icon: Truck, label: "Free Delivery", sub: "On all orders" },
                { icon: Shield, label: "Genuine", sub: "100% authentic" },
                { icon: RotateCcw, label: "Easy Returns", sub: "7 day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Icon size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{label}</p>
                  <p className="text-[9px] text-slate-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
