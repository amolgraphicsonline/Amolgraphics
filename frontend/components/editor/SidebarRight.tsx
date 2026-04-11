"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useEditor } from "@/context/EditorContext";
import { useParams } from "next/navigation";
import { Trash2, ShoppingCart, Image as ImageIcon, Check } from "lucide-react";

export const SidebarRight = () => {
  const { 
    canvas, size, setSize, triggerExport, activeTab, setActiveTab 
  } = useEditor();
  
  const params = useParams();
  const productType = (params.id as string) || "";
  const [productData, setProductData] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL) return;
    
    const fetchData = async () => {
      try {
        let res = await fetch(`${API_URL}/products/${productType}`);
        let data = await res.json();
        
        // If it's a design search for matching product by category and shape
        if (productType.startsWith("design_") || (res.status === 404 && productType.includes("design"))) {
          const dRes = await fetch(`${API_URL}/product-designs/${productType}`);
          const dData = await dRes.json();
          if (dData && !dData.error) {
            const pRes = await fetch(`${API_URL}/products`);
            const pData = await pRes.json();
            if (Array.isArray(pData)) {
               const categoryMatch = pData.filter(p => 
                  p.category?.slug?.toLowerCase() === dData.category?.toLowerCase() ||
                  p.category?.name?.toLowerCase() === dData.category?.toLowerCase() ||
                  (dData.category === "acrylic" && p.category?.name?.toLowerCase().includes("acrylic"))
               );
               
               if (categoryMatch.length > 0) {
                  const shapeMatch = categoryMatch.find(p => 
                     p.name.toLowerCase().includes(dData.shape?.toLowerCase()) ||
                     dData.shape?.toLowerCase() === "portrait" && (p.name.toLowerCase().includes("portrait") || p.name.toLowerCase().includes("photo frame"))
                  );
                  data = { ...(shapeMatch || categoryMatch[0]), designData: dData };
               } else {
                  const fallback = pData.find(p => p.category?.slug?.toLowerCase() === "acrylic" || p.category?.name?.toLowerCase().includes("acrylic"));
                  data = { ...(fallback || pData[0]), designData: dData };
               }
               data.name = dData.name;
            }
          }
        }

        setProductData(data);
        if (data.variants && data.variants.length > 0) {
          setVariants(data.variants);
          const def = data.variants.find((v: any) => v.isDefault) || data.variants[0];
          setSelectedVariant(def);
          const sizeAttr = def.variantAttributes?.find((a: any) => a.attributeName.toLowerCase() === "size");
          if (sizeAttr) setSize(sizeAttr.attributeValue);
        }
      } catch (err) {
        console.error("Customizer fetch error:", err);
      }
    };
    
    fetchData();
  }, [productType, API_URL, setSize]);

  const selectVariant = (v: any) => {
    setSelectedVariant(v);
    const sizeAttr = v.variantAttributes?.find((a: any) => a.attributeName.toLowerCase() === "size");
    if (sizeAttr) setSize(sizeAttr.attributeValue);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    // For now we just add to canvas, but in a real app we might want to map to a specific slot
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      // Use fabric to add image
      // Assuming context has a way or just use canvas directly
      const fabric = await import("fabric");
      const img = await fabric.FabricImage.fromURL(data);
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
  };

  const productName = productData?.name || productType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        
        {/* Product Details Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">Acrylic</span>
             <span className="px-2 py-0.5 bg-orange-100 text-[10px] font-bold text-orange-600 rounded uppercase tracking-wider">Portrait</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            {productName}
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-black text-[#F25A24]">₹{selectedVariant?.price || productData?.regularPrice || 0}</span>
            <span className="text-xl font-medium text-gray-300 line-through">₹{selectedVariant?.regularPrice || productData?.regularPrice || 390}</span>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
               Flat 10% Cashback
            </span>
          </div>
        </div>

        {/* 1. SELECT SIZE Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              1. Select Size <span className="text-red-500 font-normal">*</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {variants.map((v) => {
              const sizeLabel = v.variantAttributes?.find((a: any) => a.attributeName.toLowerCase() === "size")?.attributeValue || v.sku;
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => selectVariant(v)}
                  className={`group relative flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? "border-orange-500 bg-orange-50/30 text-orange-700 shadow-md ring-4 ring-orange-500/10" 
                      : "border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-black uppercase tracking-wider ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                      {sizeLabel}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 mt-0.5">Premium Glossy Finish</span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
                       <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. UPLOAD PHOTOS Section */}
        <div className="space-y-6">
          <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            2. Upload Original Photos <span className="text-red-500 font-normal">*</span>
          </h3>
          
          <div className="space-y-4">
             <button 
               onClick={() => fileRef.current?.click()}
               className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-white hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 transition-all group"
             >
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
               </div>
               <div className="text-center">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Click to upload photos</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-1">Recommended resolution: 300 DPI</p>
               </div>
             </button>
             <input ref={fileRef} type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
             
             {/* Simple Status bar */}
             <div className="flex items-center justify-between px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>0 Added</span>
                <span>3 Required</span>
             </div>
          </div>
        </div>

      </div>

      {/* Footer / Add to Cart */}
      <div className="p-8 border-t border-gray-100 bg-white">
        <button 
          onClick={triggerExport}
          className="w-full py-5 bg-[#F25A24] hover:bg-[#D54A1B] text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.25em] shadow-2xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          Confirm & Add to Cart
        </button>
        <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest mt-4">
           ✓ Secure Checkout · ✓ High Quality Print
        </p>
      </div>
    </div>
  );
};
