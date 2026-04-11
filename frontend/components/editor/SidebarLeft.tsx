"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "@/context/EditorContext";
import { Type, Image as ImageIcon, Smile, LayoutTemplate, ChevronRight } from "lucide-react";
import * as fabric from "fabric";
import { useParams } from "next/navigation";

type ActivePanel = null | "text" | "upload" | "stickers" | "designs";

const FONT_OPTIONS = ["Calibri", "Outfit", "Georgia", "Arial", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS"];
const STICKER_EMOJIS = ["❤️","⭐","🎉","🎨","🔥","✨","💎","🌸","🎁","🦋","🌈","🏆","🎸","🌙","☀️","🍀"];

export const SidebarLeft = () => {
  const { 
    canvas, triggerAddToCanvas, designs, setDesigns, 
    activeDesign, setActiveDesign, setActiveTab 
  } = useEditor();
  const params = useParams();
  const productType = (params.id as string) || "";
  
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [textValue, setTextValue] = useState("Your Text");
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isTshirt, setIsTshirt] = useState(productType.toLowerCase().includes("tshirt"));
  const fileRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch Product Data and then its related Designs
  useEffect(() => {
    if (!API_URL || !productType) return;
    
    fetch(`${API_URL}/products/${productType}`)
      .then(res => res.json())
      .then(data => {
        setIsTshirt(data.category?.name?.toLowerCase().includes("tshirt") || productType.toLowerCase().includes("tshirt"));
        const catName = data.category?.name || "general";
        fetch(`${API_URL}/product-designs?category=${encodeURIComponent(catName)}`)
          .then(res => res.json())
          .then(setDesigns)
          .catch(() => setDesigns([]));
      })
      .catch(() => setDesigns([]));
  }, [productType, API_URL, setDesigns]);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const handleDesignSelect = (design: any) => {
    setActiveDesign(design);
    setActiveTab("preview"); 
  };

  const addTextToSide = (side?: "front" | "back") => {
    const text = new fabric.IText(textValue || "Your Text", {
      left: 100, top: 100,
      fontFamily, fontSize, fill: textColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
    });
    triggerAddToCanvas(side ?? "current", text);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await fabric.FabricImage.fromURL(data);
      triggerAddToCanvas("current", img);
    };
    reader.readAsDataURL(file);
  };

  const addSticker = (emoji: string) => {
    if (!canvas) return;
    const text = new fabric.IText(emoji, {
      left: (canvas.width || 0) / 2,
      top: (canvas.height || 0) / 2,
      originX: "center", originY: "center",
      fontSize: 48, selectable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const NAV_ITEMS = [
    { id: "designs", icon: LayoutTemplate, label: "Templates" },
    { id: "text", icon: Type, label: "Text" },
    { id: "upload", icon: ImageIcon, label: "Image" },
    { id: "stickers", icon: Smile, label: "Stickers" },
  ] as const;

  return (
    <div className="flex h-full z-10 font-inter">
      {/* Icon Rail */}
      <div className="w-[72px] h-full bg-[#111318] flex flex-col items-center pt-6 pb-4 gap-1 border-r border-white/5">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => togglePanel(id as any)}
            className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 mb-1
              ${activePanel === id ? "bg-orange-600 text-white shadow-lg shadow-orange-900/40" : "text-white/40 hover:text-white hover:bg-white/8"}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[12px]  capitalize tracking-wider mt-0.5 opacity-70">{label}</span>
          </button>
        ))}
      </div>

      {/* Slide-out Panels */}
      {activePanel && (
        <div className="w-80 h-full bg-[#1a1d26] border-r border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-200 text-white shadow-2xl">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/10">
            <h3 className="text-base  text-white tracking-widest capitalize">{activePanel}</h3>
            <button onClick={() => setActivePanel(null)} className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Designs/Templates Panel */}
            {activePanel === "designs" && (
              <div className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    {designs.map((design) => (
                      <button key={design.id} onClick={() => handleDesignSelect(design)}
                        className={`group relative aspect-square bg-white/5 rounded-2xl border-2 transition-all p-3 flex flex-col items-center justify-center gap-2
                          ${activeDesign?.id === design.id ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10" : "border-white/5 hover:border-white/20 hover:bg-white/10"}`}
                      >
                        {design.previewImage ? (
                          <img src={design.previewImage} alt={design.name} className="w-full h-full object-contain rounded-xl shadow-xl transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                             <LayoutTemplate className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                        <span className="text-[11px]  text-white capitalize tracking-tighter text-center line-clamp-1">{design.name}</span>
                      </button>
                    ))}
                    {designs.length === 0 && (
                       <div className="col-span-2 py-12 text-center space-y-5 opacity-20">
                          <LayoutTemplate className="w-12 h-12 mx-auto" />
                          <p className="text-base font-medium leading-relaxed px-4">No custom layouts found for this category.</p>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {/* Text Panel */}
            {activePanel === "text" && (
              <div className="p-6 space-y-6">
                <input value={textValue} onChange={(e) => setTextValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-medium focus:outline-none focus:border-orange-500 transition-all shadow-inner" placeholder="Enter text..." />
                
                <div className="space-y-4">
                  <label className="text-[12px]  text-white/30 capitalize tracking-widest pl-1">Size: {fontSize}px</label>
                  <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setIsBold(b => !b)} className={`flex-1 py-4 rounded-2xl text-[12px]  transition-all ${isBold ? 'bg-orange-600 shadow-lg shadow-orange-950/20 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>BOLD</button>
                  <button onClick={() => setIsItalic(i => !i)} className={`flex-1 py-4 rounded-2xl text-[12px]  transition-all ${isItalic ? 'bg-orange-600 shadow-lg shadow-orange-950/20 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>ITALIC</button>
                </div>

                {isTshirt ? (
                  <div className="space-y-3 pt-6 border-t border-white/5 text-center">
                    <button onClick={() => addTextToSide("front")} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white  text-base capitalize tracking-widest rounded-2xl transition-all shadow-xl shadow-orange-950/20 active:scale-95">👕 Add to Front</button>
                    <button onClick={() => addTextToSide("back")} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white  text-base capitalize tracking-widest rounded-2xl transition-all active:scale-95">🔄 Add to Back</button>
                  </div>
                ) : (
                  <button onClick={() => addTextToSide()} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white  text-base capitalize tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-orange-950/20 active:scale-95">INSERT TEXT</button>
                )}
              </div>
            )}

            {/* Upload Panel */}
            {activePanel === "upload" && (
              <div className="p-6">
                <button onClick={() => fileRef.current?.click()} className="w-full h-56 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 text-white/30 hover:text-white hover:border-orange-500 hover:bg-orange-500/5 transition-all group overflow-hidden relative shadow-inner">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon className="w-8 h-8 text-white/40 group-hover:text-orange-500" /></div>
                  <div className="text-center px-6"><p className="text-base  text-white/90 capitalize tracking-widest leading-none">Upload Media</p><p className="text-[12px] text-white/20 mt-2 capitalize tracking-widest leading-relaxed">System will auto-fit into design</p></div>
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>
            )}

            {activePanel === "stickers" && (
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3">
                  {STICKER_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => addSticker(emoji)} className="h-16 flex items-center justify-center text-3xl bg-white/5 border border-white/5 rounded-2xl hover:bg-orange-600/20 hover:border-orange-600/40 hover:scale-110 transition-all">{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

