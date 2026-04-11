"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number;
  saleStartDate?: string;
  saleEndDate?: string;
  mainImage: string;
  images?: string; // LongText string (JSON array)
  category: { name: string, slug?: string };
  isReadyToSale?: boolean;
  variants?: Array<{
    id: string;
    price: number;
    salePrice: number | null;
    saleStartDate?: string;
    saleEndDate?: string;
    variantAttributes?: Array<{ attributeName: string, attributeValue: string }>;
  }>;
  rating?: number;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  apiUrl: string;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string) => void;
  isWishlisted: boolean;
}

const resolveMedia = (path: string, apiUrl: string) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith('http')) return path;
  const baseUrl = apiUrl.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default function ProductCard({ product, apiUrl, onAddToCart, onWishlist, isWishlisted }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  
  // Parse images JSON if it exists
  let secondaryImage = "";
  try {
    if (product.images) {
      const allImages = JSON.parse(product.images);
      if (Array.isArray(allImages) && allImages.length > 1) {
        secondaryImage = allImages[1];
      }
    }
  } catch (e) {}

  if (!product) return null;

  const now = new Date();

  const getEffectivePrice = (p: any) => {
    const isSaleActive = (salePrice: number | null, start?: string, end?: string) => {
      if (!salePrice) return false;
      const s = start ? new Date(start) : null;
      const e = end ? new Date(end) : null;
      if (s && s > now) return false;
      if (e && e < now) return false;
      return true;
    };

    let minActive = Infinity;
    let maxRegular = 0;

    // Check main product
    const mainActive = isSaleActive(p.salePrice, p.saleStartDate, p.saleEndDate) ? p.salePrice : p.regularPrice;
    if (mainActive) minActive = Math.min(minActive, mainActive);
    if (p.regularPrice) maxRegular = Math.max(maxRegular, p.regularPrice);

    // Check variants
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v: any) => {
        const vActive = isSaleActive(v.salePrice, v.saleStartDate, v.saleEndDate) ? v.salePrice : v.price;
        if (vActive) minActive = Math.min(minActive, vActive);
        if (v.price) maxRegular = Math.max(maxRegular, v.price);
      });
    }

    const finalPrice = minActive === Infinity ? (p.regularPrice || 0) : minActive;
    const originalPrice = maxRegular || finalPrice;
    const discount = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

    return { finalPrice, originalPrice, discount };
  };

  const { finalPrice, originalPrice, discount } = getEffectivePrice(product);

  return (
    <div 
      className="group bg-white rounded-[1.25rem] overflow-hidden hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] transition-all duration-700 border border-transparent hover:border-slate-50 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#FBFBFB]">
        {/* Images */}
        <Link 
          href={
            product.isReadyToSale 
            ? `/products/${product.id}` 
            : ((product.category?.slug?.includes('acrylic')) || 
              (product.category?.name?.toLowerCase().includes('acrylic')) ||
              (product.category?.name?.toLowerCase().includes('lamp')) ||
              (product.category?.name?.toLowerCase().includes('clock')) ||
              (product.category?.name?.toLowerCase().includes('album'))) 
            ? `/studio-v2?category=${product.category?.slug || 'acrylic'}&productId=${product.id}` 
            : `/product/${product.slug}`
          } 
          className="block w-full h-full relative"
        >
          <img
            src={resolveMedia(product.mainImage, apiUrl)}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105 ${hovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}
          />
          {secondaryImage && (
            <img
              src={resolveMedia(secondaryImage, apiUrl)}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            />
          )}
        </Link>

        {/* Wishlist Button - Glassmorphism */}
        <button 
          onClick={() => onWishlist(product.id)}
          className="absolute top-3 right-3 p-2 bg-white/40 backdrop-blur-xl rounded-xl text-white hover:text-white hover:bg-orange-500 transition-all z-10 shadow-sm border border-white/20"
        >
          <Heart className={`w-3 h-3 transition-colors ${isWishlisted ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Ready to Sale Badge */}
        {product.isReadyToSale && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[7px]  capitalize tracking-widest z-10 shadow-lg shadow-emerald-500/20">
            Quick Buy
          </div>
        )}

        {/* Discount Badge - Premium */}
        {discount > 0 && !product.isReadyToSale && (
          <div className="absolute top-4 left-4 bg-[#FF6A00] text-white px-3 py-1 rounded-full text-[12px]  capitalize tracking-[0.1em] z-10 shadow-xl shadow-orange-500/20 italic">
            -{discount}%
          </div>
        )}

        {/* Hover Add to Cart Overlay */}
        <div className={`absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-20`}>
          <button 
            onClick={() => onAddToCart(product)}
            className={`w-full text-white py-3 rounded-lg flex items-center justify-center gap-2 text-[12px]  capitalize tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${product.isReadyToSale ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#111111] hover:bg-orange-500'}`}
          >
            <ShoppingBag className="w-3 h-3" />
            {product.isReadyToSale ? 'BUY NOW' : 'CUSTOMIZE'}
          </button>
        </div>

        {/* Subtle Quick View */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
           <div className={`w-16 h-16 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-1000 flex items-center justify-center border border-white/10`}>
             <Eye className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-1.5 relative group/content bg-white group-hover:bg-[#111111] transition-all duration-700">
         <div className="space-y-0.5">
            <p className="text-[8.5px]  text-slate-300 group-hover:text-slate-500 capitalize tracking-[0.2em] leading-none mb-0.5 transition-colors">{product.category?.name || "Uncategorized"}</p>
            <h3 className=" text-[#111111] group-hover:text-white capitalize tracking-tight text-[11px] leading-tight transition-colors truncate">
              {product.name}
            </h3>
         </div>
 
         {/* Price - Luxury Layout */}
         {/* Price - Premium High Density Layout */}
         <div className="flex items-end justify-between border-t border-slate-50 group-hover:border-white/10 pt-2 transition-colors">
            <div className="flex flex-col">
              <span className="text-[12px]  text-slate-300 group-hover:text-slate-500 capitalize tracking-widest leading-none mb-1 transition-colors italic">Price</span>
              <div className="flex items-center gap-1">
                <span className="text-base  text-[#111111] group-hover:text-white tracking-tighter leading-none transition-colors">₹{finalPrice.toLocaleString()}</span>
                {discount > 0 && (
                  <span className="text-[11px] font-medium text-slate-200 group-hover:text-white/20 line-through tracking-tighter leading-none transition-colors">₹{originalPrice.toLocaleString()}</span>
                )}
               </div>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-50 group-hover:bg-white/5 px-1.5 py-0.5 rounded-md border border-slate-100 group-hover:border-white/10 transition-colors">
               <Star className="w-1.5 h-1.5 fill-orange-400 text-orange-400" />
               <span className="text-[11px]  text-[#111111] group-hover:text-white tracking-wider leading-none transition-colors">4.9</span>
            </div>
         </div>
      </div>
    </div>
  );
}
