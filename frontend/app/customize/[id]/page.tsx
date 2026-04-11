"use client";

import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { useState } from "react";
import { useParams } from "next/navigation";

import { EditorLayout } from "@/components/editor/EditorLayout";
import { EditorProvider } from "@/context/EditorContext";
import { useEditor } from "@/context/EditorContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

function CustomizerPageContent() {
  const params = useParams();
  const productType = params.id as string;
  const [isSaved, setIsSaved] = useState(false);
  const { addToCart, cart } = useCart();
  const { size } = useEditor();

  // Normalize product slug → mockup filename
  // T-shirts: any tshirt_* variant → use tshirt_front.png (back handled in EditorCanvas)
  const getMockupImage = () => {
    const base = productType.toLowerCase();
    if (base.includes("tshirt")) return "/mockups/tshirt_front.png";
    return `/mockups/${productType}.png`;
  };
  const mockupImage = getMockupImage();

  const PRICES = {
    mug: 249,
    tshirt_front: 499,
    tshirt_both: 699,
  };

  const handleSave = (dataUrl: string, json: string, color: string, backDataUrl?: string, backJson?: string, backHasContent?: boolean) => {
    const name = productType.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const isTshirt = productType.includes("tshirt");
    const isMug = productType.includes("mug");
    const printSides = (isTshirt && backHasContent) ? "both" : "front";
    const price = isMug
      ? PRICES.mug
      : printSides === "both"
        ? PRICES.tshirt_both
        : PRICES.tshirt_front;

    addToCart({
      id: Math.random().toString(36).substr(2, 9),
      productId: productType,
      name: `Custom ${name}`,
      price,
      image: dataUrl,
      backImage: (isTshirt && backHasContent) ? backDataUrl : undefined,
      quantity: 1,
      designJson: json,
      backDesignJson: (isTshirt && backHasContent) ? backJson : undefined,
      color,
      printSides: isTshirt ? printSides as "front" | "both" : undefined,
      size: isTshirt ? size : undefined,
    });
    setIsSaved(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f4f5f7]">
      {/* Studio Header */}
      <header className="h-14 bg-[#111318] flex items-center justify-between px-6 flex-shrink-0 border-b border-white/5 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">AG</span>
          </div>
          <span className="text-white font-black text-sm tracking-tight">
            Amol<span className="text-orange-500">Graphics</span>
          </span>
        </Link>

        {/* Center Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-white/30">
          <span>Studio</span>
          <span>/</span>
          <span className="text-white/60 capitalize">{productType.split("_").join(" ")}</span>
          <span>/</span>
          <span className="text-orange-400">Customize</span>
        </div>

        {/* Cart */}
        <Link href="/checkout" className="relative flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xs font-black transition-all border border-white/5">
          <ShoppingBag className="w-4 h-4" />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] flex items-center justify-center font-black">
              {cart.length}
            </span>
          )}
        </Link>
      </header>

      {/* Editor takes remaining height */}
      <div className="flex-1 min-h-0">
        <EditorLayout
          productType={productType}
          mockupImage={mockupImage}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export default function CustomizerPage() {
  return (
    <EditorProvider>
      <CustomizerPageContent />
    </EditorProvider>
  );
}
