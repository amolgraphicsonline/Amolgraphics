"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Upload, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2, Move, Type, MousePointer2, X 
} from "lucide-react";

export const resolveMedia = (url: string | null | undefined, apiUrl?: string) => {
  if (!url) return undefined;
  if (typeof url !== 'string') return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = apiUrl?.replace("/api", "") || "";
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};

export function useBase64(url?: string) {
  const [b64, setB64] = useState(url);
  useEffect(() => {
    if (!url) return;
    if (url.startsWith('data:')) { setB64(url); return; }
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => setB64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => setB64(url)); // fallback safely to raw url
  }, [url]);
  return b64;
}

export const Base64Image = ({ url, className, alt }: { url?: string; className?: string; alt?: string }) => {
  const b64 = useBase64(url);
  if (!b64) return null;
  return <img src={b64} className={className} alt={alt || ""} crossOrigin="anonymous" />;
};

export interface PhotoState {
  url: string;
  scale: number;
  x: number;
  y: number;
  rotate: number;
}

export interface TextState {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  x: number;
  y: number;
  rotate: number;
}

export interface IconState {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

export function Slot({ idx, photos, isFinal, onUpload, onAdjust, onDoubleClick, shape, apiUrl, showOnlyCues = false }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = photos?.[idx];
  const photoUrl = resolveMedia(typeof photo === 'string' ? photo : photo?.url || "", apiUrl);
  const safeBase64Url = useBase64(photoUrl);
  const hasPhoto = !!photoUrl;

  const scale = (photo as any)?.scale || 1;
  const x = (photo as any)?.x || 0;
  const y = (photo as any)?.y || 0;
  const rotate = (photo as any)?.rotate || 0;

  const [activeAction, setActiveAction] = useState<'move' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, photoX: 0, photoY: 0 });

  const currentPhoto = useMemo(() =>
    (typeof photo === 'object' && photo !== null) ? photo : { url: photoUrl, scale, x, y, rotate }
    , [photo, photoUrl, scale, x, y, rotate]);

  useEffect(() => {
    if (!activeAction || !onAdjust) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onAdjust(idx, { ...currentPhoto, x: dragStart.photoX + dx, y: dragStart.photoY + dy });
    };

    const handleMouseUp = () => setActiveAction(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeAction, dragStart, currentPhoto, idx, onAdjust]);

  const handleActionStart = (e: React.MouseEvent) => {
    if (isFinal || !hasPhoto || !onAdjust) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveAction('move');
    setDragStart({ x: e.clientX, y: e.clientY, photoX: x, photoY: y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isFinal || !hasPhoto || !onAdjust) return;
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    onAdjust(idx, { ...currentPhoto, scale: Math.max(0.1, Math.min(10, scale + delta)) });
  };

  const selectBtn = !hasPhoto && (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto p-1">
      <input 
        id={`upload-${idx}`}
        ref={inputRef} 
        type="file" 
        accept="image/*,.webp,.avif" 
        className="hidden" 
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) {
            onUpload(idx, file);
          }
        }} 
      />
      <label 
        htmlFor={`upload-${idx}`}
        className="cursor-pointer bg-[#1877F2] text-white px-3 py-2 rounded-xl font-black text-[11px] leading-tight uppercase tracking-tight shadow-lg hover:bg-[#166fe5] hover:scale-105 active:scale-95 transition-all text-center flex items-center gap-1.5 border-2 border-white/20 whitespace-nowrap"
      >
        <Upload size={14} strokeWidth={3} />
        Select Photo
      </label>
    </div>
  );

  if (showOnlyCues) {
    return (
      <div
        className={`absolute inset-0 z-50 cursor-pointer flex items-center justify-center group ${hasPhoto ? 'cursor-move' : ''} pointer-events-auto`}
        onMouseDown={handleActionStart}
        onWheel={handleWheel}
      >
        {selectBtn}
        {hasPhoto && !isFinal && (
          <button 
            onClick={(e) => { e.stopPropagation(); onUpload(idx, ""); }}
            className="absolute top-1 right-1 z-[60] w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 pointer-events-auto"
            title="Remove Photo"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
        {hasPhoto && !isFinal && (
          <div className="absolute bottom-1 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl px-1.5 py-0.5 rounded-lg shadow-xl border border-slate-100 flex items-center gap-1 scale-75 origin-bottom pointer-events-auto">
              <button onClick={(e) => { e.stopPropagation(); onAdjust(idx, { ...currentPhoto, scale: Math.max(0.1, scale - 0.1) }) }} className="p-1 hover:bg-slate-50 text-slate-400 rounded"><ZoomOut size={12} /></button>
              <span className="text-[10px] w-6 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={(e) => { e.stopPropagation(); onAdjust(idx, { ...currentPhoto, scale: Math.min(10, scale + 0.1) }) }} className="p-1 hover:bg-slate-50 text-slate-400 rounded"><ZoomIn size={12} /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className={`absolute inset-0 w-full h-full overflow-hidden ${hasPhoto && !isFinal ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'} ${!hasPhoto ? 'bg-black/5 flex items-center justify-center' : ''}`}>
      {selectBtn}
      {hasPhoto && !isFinal && (
        <button 
          onClick={(e) => { e.stopPropagation(); onUpload(idx, ""); }}
          className="absolute top-2 right-2 z-[60] w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 pointer-events-auto"
          title="Remove Photo"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}
      {hasPhoto && (
        <img
          src={safeBase64Url || resolveMedia(photoUrl, apiUrl)}
          crossOrigin="anonymous"
          className="absolute inset-0 select-none pointer-events-none w-full h-full object-cover"
          style={{
            transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        />
      )}
    </div>
  );
}

/**
 * --- CUSTOM OVERLAY ELEMENT (TEXT/ICON) ---
 */
export function OverlayElement({ element, type, isFinal, onUpdate, onDelete, apiUrl }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 });

  useEffect(() => {
    if (!isDragging || isFinal) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onUpdate(element.id, { ...element, x: dragStart.elX + dx, y: dragStart.elY + dy });
    };

    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, element, isFinal, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFinal) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, elX: element.x, elY: element.y });
  };

  return (
    <div
      className={`absolute group cursor-move ${isDragging ? 'z-50' : 'z-40'}`}
      style={{
        left: element.x,
        top: element.y,
        transform: `rotate(${element.rotate || 0}deg) scale(${element.scale || 1})`,
        transformOrigin: 'center center'
      }}
      onMouseDown={handleMouseDown}
    >
      {type === 'text' ? (
        <span
          style={{
            fontFamily: element.font,
            fontSize: `${element.size}px`,
            color: element.color,
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            WebkitTextStroke: element.color === '#ffffff' ? '1px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {element.text}
        </span>
      ) : (
        <img src={resolveMedia(element.url, apiUrl)} crossOrigin="anonymous" className="w-16 h-16 object-contain" alt="" />
      )}

      {!isFinal && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-slate-100 flex items-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onUpdate(element.id, { ...element, rotate: (element.rotate || 0) + 15 })} className="p-1.5 hover:bg-slate-50 text-slate-400"><RotateCw size={12} /></button>
          <button onClick={() => onUpdate(element.id, { ...element, scale: (element.scale || 1) + 0.1 })} className="p-1.5 hover:bg-slate-50 text-slate-400"><ZoomIn size={12} /></button>
          <button onClick={() => onUpdate(element.id, { ...element, scale: Math.max(0.1, (element.scale || 1) - 0.1) })} className="p-1.5 hover:bg-slate-50 text-slate-400"><ZoomOut size={12} /></button>
          <button onClick={() => onDelete(element.id)} className="p-1.5 hover:bg-rose-50 text-rose-500"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
}

export function DesignCanvas({
  design, shape, photos, texts = [], icons = [],
  isFinal = false, isCapturing = false, apiUrl, onUpload, onAdjust,
  onUpdateText, onDeleteText, onUpdateIcon, onDeleteIcon,
  selectedSize, productCategory, shapeImage, activeTab, categoryImage
}: any) {
  // Re-save trigger: ensure isCapturing scope is active.
  const slots = design?.photoCount || 1;
  const name = (design?.name || "").toLowerCase();
  const category = (productCategory || design?.category || "").toLowerCase();

  const isHeart = name.includes('heart') || (shape || "").toLowerCase() === 'heart' || category.includes('heart');
  const isLamp = name.includes('lamp') || category.includes('lamp');
  const isClock = name.includes('clock') || category.includes('clock');
  const isLetter = name.includes('letter') || name.includes('initial') || name.includes('alphabet') || name.includes('alpha') || category.includes('alpha');

  const layout = useMemo(() => {
    const isSpecialWord = (name.includes('mom') || name.includes('dad') || name.includes('love') || name.includes('mother') || name.includes('father'));

    // Special Layout for 'LOVE' - 4 Photo Slots in a 2x4 checkerboard grid
    // Row 1: [L] [Photo 0] [V] [Photo 1] | Row 2: [Photo 2] [O] [Photo 3] [E]
    if (name.includes('love')) {
      return [
        { x: 26, y: 1, w: 23, h: 48 },  // Row 1, Col 2 (Photo 0)
        { x: 76, y: 1, w: 23, h: 48 },  // Row 1, Col 4 (Photo 1)
        { x: 1, y: 51, w: 23, h: 48 },  // Row 2, Col 1 (Photo 2)
        { x: 51, y: 51, w: 23, h: 48 }, // Row 2, Col 3 (Photo 3)
      ];
    }

    if (isSpecialWord) {
      return [
        { x: 52, y: 5, w: 45, h: 30 }, // Top Right
        { x: 3, y: 35, w: 45, h: 30 },  // Middle Left
        { x: 52, y: 65, w: 45, h: 30 }, // Bottom Right
      ];
    }

    if (slots === 1) {
      const isShifted = isHeart || isLamp || isClock;
      if (isLetter) return [{ x: 5, y: 45, w: 90, h: 50 }];
      return [{ x: 0, y: 0, w: 100, h: 100 }];
    }

    // Generic Grid - Improved for better spacing
    return Array.from({ length: Math.max(slots, 1) }).map((_, i) => ({
      x: (i % 2) * 50 + 2, y: Math.floor(i / 2) * (100 / Math.ceil(slots / 2)) + 2, w: 46, h: (100 / Math.ceil(slots / 2)) - 4
    }));
  }, [slots, isHeart, isLetter, isLamp, isClock, name]);

  return (
    <div className="relative bg-white overflow-hidden w-full h-full" style={{
      borderRadius: isHeart ? '0' : '20px'
    }}>
      {/* Background/Photo Layer */}
      <div className="absolute inset-0 z-10">
        {layout.map((p, i) => (
          <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}>
            <Slot idx={i} photos={photos} isFinal={isFinal} onAdjust={onAdjust} onUpload={onUpload} apiUrl={apiUrl} />
          </div>
        ))}
      </div>

      {/* Template Image Layer: Dynamically switch depth during capture to ensure photos aren't hidden by multiply modes */}
      <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${
        isCapturing ? 'z-5' : 'z-20'
      }`}>
        {/* Step 1: Category Image (The big picture of the brand/catalog) */}
        {categoryImage && activeTab === 'categories' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-700">
            <img
              src={resolveMedia(categoryImage, apiUrl)}
              crossOrigin="anonymous"
              className="w-full h-full object-cover animate-in fade-in zoom-in-90 duration-500"
              alt="Selected Category"
            />
          </div>
        )}

        {/* Step 2: Shape Image (The big picture of the product orientation) */}
        {shapeImage && activeTab === 'shapes' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-700">
            <img
              src={resolveMedia(shapeImage, apiUrl)}
              crossOrigin="anonymous"
              className="w-full h-full object-cover animate-in fade-in zoom-in-90 duration-500"
              alt="Selected Shape"
            />
          </div>
        )}

        {/* Step 3+: Design Template Layer: Visible only from Designs onwards */}
        {design?.previewImage && activeTab !== 'categories' && activeTab !== 'shapes' && (
          <div className="absolute inset-0 flex items-center justify-center z-18 transition-all duration-700">
            <Base64Image
              url={resolveMedia(design.previewImage, apiUrl)}
              className={`w-full h-full object-fill animate-in fade-in zoom-in-90 duration-500 ${!isCapturing ? 'mix-blend-multiply' : ''}`}
              alt="Template Design"
            />
          </div>
        )}
      </div>

      {/* TEXTS & ICONS OVERLAY (Z-index 40) */}
      <div className="absolute inset-0 z-40 pointer-events-none origin-center *:pointer-events-auto">
        {texts.map((text: any) => (
          <OverlayElement
            key={text.id}
            type="text"
            element={text}
            isFinal={isFinal}
            onUpdate={onUpdateText}
            onDelete={onDeleteText}
          />
        ))}
        {icons.map((icon: any) => (
          <OverlayElement
            key={icon.id}
            type="icon"
            element={icon}
            isFinal={isFinal}
            onUpdate={onUpdateIcon}
            onDelete={onDeleteIcon}
            apiUrl={apiUrl}
          />
        ))}
      </div>

      {/* Interaction Layers (Z-index 30) */}
      {!isFinal && (
        <div className="absolute inset-0 z-30 pointer-events-none *:pointer-events-auto">
          {layout.map((p, i) => (
            <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}>
              <Slot
                idx={i}
                photos={photos}
                onUpload={onUpload}
                onAdjust={onAdjust}
                apiUrl={apiUrl}
                showOnlyCues={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
