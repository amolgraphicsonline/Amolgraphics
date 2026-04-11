"use client";

import React, { useCallback, useState } from "react";
import { SidebarRight } from "./SidebarRight";
import { EditorCanvas } from "./EditorCanvas";
import { useEditor } from "@/context/EditorContext";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import Link from "next/link";

interface EditorLayoutProps {
  productType: string;
  mockupImage: string;
  onSave: (dataUrl: string, json: string, color: string, backDataUrl?: string, backJson?: string, backHasContent?: boolean) => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ productType, mockupImage, onSave }) => {
  const { bgColor } = useEditor();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const productName = productType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const memoizedOnSave = useCallback((dataUrl: string, json: string, backDataUrl?: string, backJson?: string, backHasContent?: boolean) => {
    onSave(dataUrl, json, bgColor, backDataUrl, backJson, backHasContent);
  }, [onSave, bgColor]);

  const memoizedOnPreview = useCallback((url: string) => {
    setPreviewUrl(url);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#f4f5f7] overflow-hidden">
      
      {/* 1. TOP BREADCRUMBS */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/shop" className="hover:text-gray-900 transition-colors">SHOP</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{productName}</span>
            <span className="text-gray-300">/</span>
            <span className="text-orange-600">CUSTOMIZE</span>
          </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 2. CENTRE PREVIEW AREA */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-[800px] w-full mx-auto space-y-6">
            
            {/* Live Preview Container */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-14 border-b border-gray-50 flex items-center justify-between px-6 shrink-0 bg-white">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em]">LIVE PREVIEW</span>
                <div className="flex items-center gap-4 text-gray-400">
                   <div className="flex items-center gap-1">
                      <button className="p-1 hover:text-orange-600"><ZoomOut size={16}/></button>
                      <span className="text-xs font-bold text-gray-500 min-w-[35px] text-center">100%</span>
                      <button className="p-1 hover:text-orange-600"><ZoomIn size={16}/></button>
                   </div>
                   <div className="w-px h-4 bg-gray-100 mx-1" />
                   <button className="p-1 hover:text-orange-600"><Maximize2 size={16}/></button>
                </div>
              </div>

              {/* Canvas area */}
              <div className="relative aspect-square flex items-center justify-center p-8 bg-[#fafafa]">
                 {/* Decorative Grid BG */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                 
                 <div className="relative w-full h-full max-w-[500px] max-h-[500px] shadow-2xl rounded-lg overflow-hidden bg-white">
                    <EditorCanvas
                      productType={productType}
                      mockupImage={mockupImage}
                      onSave={memoizedOnSave}
                      onPreview={memoizedOnPreview}
                    />
                 </div>
              </div>
            </div>

            {/* Hint / Tutorial */}
            <div className="flex items-center justify-center gap-4 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
               Click placeholders to upload photos · drag to move
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR */}
        <div className="w-[420px] bg-white border-l border-gray-200 shrink-0 overflow-y-auto">
          <SidebarRight />
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)] w-full max-w-3xl flex flex-col">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-xl text-gray-900 tracking-tight">Design Preview</h3>
                <p className="text-base text-gray-400 font-medium capitalize tracking-widest mt-0.5">High-resolution · Print-ready</p>
              </div>
              <button onClick={() => setPreviewUrl(null)}
                className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all hover:rotate-90 duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-10">
              <img src={previewUrl} alt="Preview" className="max-h-[60vh] w-auto object-contain rounded-2xl shadow-2xl border border-gray-200/50" />
            </div>
            <div className="flex gap-4 px-8 py-5 border-t border-gray-100">
              <button onClick={() => setPreviewUrl(null)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl text-base hover:bg-gray-50 transition-all">
                ← Edit More
              </button>
              <button onClick={() => setPreviewUrl(null)}
                className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-base hover:bg-orange-500 transition-all shadow-lg shadow-orange-200">
                Looks Great! ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
