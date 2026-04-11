"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useEditor } from "@/context/EditorContext";
import type { TshirtSide } from "@/context/EditorContext";

interface EditorCanvasProps {
  productType: string;
  mockupImage: string;
  onSave: (dataUrl: string, json: string, backDataUrl?: string, backJson?: string, backHasContent?: boolean) => void;
  onPreview?: (dataUrl: string) => void;
}

const applyColorFilter = (img: fabric.FabricImage, bgColor: string) => {
  const filters: any[] = [
    new fabric.filters.RemoveColor({ color: "#ffffff", distance: 0.05 }),
  ];
  if (bgColor !== "#ffffff") {
    filters.push(new fabric.filters.BlendColor({ color: bgColor, mode: "multiply", alpha: 1 }));
  }
  img.filters = filters;
  img.applyFilters();
};

const updateMockupColor = (fc: fabric.Canvas, bgColor: string) => {
  fc.set("backgroundColor", "#ffffff");
  const mockup = fc.getObjects().find(o => (o as any).name === "productMockup") as fabric.FabricImage | undefined;
  if (mockup) {
    applyColorFilter(mockup, bgColor);
    fc.renderAll();
  }
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ productType, mockupImage, onSave, onPreview }) => {
  const isTshirt = productType.toLowerCase().includes("tshirt");
  const { 
    setCanvas, setActiveObject, bgColor, setTriggerExport, 
    setTriggerPreview, setTriggerSideSwitch, setTriggerAddToCanvas, 
    activeSide, setActiveSide, activeDesign 
  } = useEditor();

  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontCanvas = useRef<fabric.Canvas | null>(null);
  const backCanvas = useRef<fabric.Canvas | null>(null);
  const frontInitialized = useRef(false);
  const backInitialized = useRef(false);

  const canvasWidth = isTshirt ? 500 : 700;
  const canvasHeight = 700;

  // Design Templates / Placeholders Logic
  const getShapePath = (shape: string) => {
    switch (shape.toLowerCase()) {
      case "heart":
        return "M 250 450 C 250 450 450 325 450 225 C 450 150 400 100 350 100 C 300 100 250 150 250 150 C 250 150 200 100 150 100 C 100 100 50 150 50 225 C 50 325 250 450 250 450 Z";
      case "circle":
        return "M 250,50 A 200,200 0 1,1 250,450 A 200,200 0 1,1 250,50 Z";
      default: // Square / Rect
        return "M 50,50 H 450 V 450 H 50 Z";
    }
  };

  const applyDesignTemplate = useCallback(async (fc: fabric.Canvas, design: any) => {
    if (!fc || !design) return;

    // Clear user content but keep mockup
    const objects = fc.getObjects();
    objects.forEach(obj => {
      if ((obj as any).name !== "productMockup") fc.remove(obj);
    });

    const photoCount = design.photoCount || 1;
    const shape = design.shape || "square";
    const pathStr = getShapePath(shape);

    for (let i = 0; i < photoCount; i++) {
        const placeholder = new fabric.Path(pathStr, {
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: "center",
          originY: "center",
          fill: "#f8fafc",
          stroke: "#cbd5e1",
          strokeWidth: 2,
          strokeDashArray: [10, 5],
          selectable: false,
          evented: true,
          name: `placeholder_${i}`,
        });

        // Add "SELECT PHOTO" Button (Group of Rect + Text)
        const btnRect = new fabric.Rect({
          width: 120,
          height: 45,
          fill: "#1A73E8",
          rx: 6, ry: 6,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });

        const btnText = new fabric.IText("SELECT\nPHOTO", {
          fontSize: 12,
          fontFamily: "Outfit",
          fontWeight: "900",
          fill: "#ffffff",
          textAlign: "center",
          lineHeight: 1,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });

        const button = new fabric.Group([btnRect, btnText], {
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
          name: `label_${i}`,
        });

        fc.add(placeholder, button);
    }
    fc.renderAll();
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (activeDesign && frontCanvas.current) {
        applyDesignTemplate(frontCanvas.current, activeDesign);
    }
  }, [activeDesign, applyDesignTemplate]);

  // Sync Color, Switch sides etc... (Keep existing logic around line 62-134)
  const setupMockup = async (fc: fabric.Canvas, url: string, color: string) => {
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      img.set({
        selectable: false, evented: false,
        originX: "center", originY: "center",
        left: canvasWidth / 2, top: canvasHeight / 2,
        name: "productMockup",
      });
      img.scaleToHeight(canvasHeight - 50);
      applyColorFilter(img, color);
      fc.insertAt(0, img);
      fc.renderAll();
    } catch { fc.renderAll(); }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<string | null>(null);

  const handlePlaceholderClick = useCallback((e: any) => {
    const obj = e.target;
    if (obj && obj.name?.startsWith("placeholder")) {
      activeSlotRef.current = obj.name;
      fileInputRef.current?.click();
    }
  }, []);

  const handleCanvasUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !activeSlotRef.current) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await fabric.FabricImage.fromURL(data);
      triggerAddToCanvas("current", img);
      activeSlotRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!frontRef.current || frontInitialized.current) return;
    frontInitialized.current = true;
    const fc = new fabric.Canvas(frontRef.current, { 
      width: canvasWidth, 
      height: canvasHeight, 
      backgroundColor: "#ffffff",
      preserveObjectStacking: true 
    });
    frontCanvas.current = fc;
    setCanvas(fc);
    setupMockup(fc, isTshirt ? "/mockups/tshirt_front.png" : mockupImage, bgColor);
    
    fc.on("selection:created", (e) => setActiveObject(e.selected[0]));
    fc.on("selection:updated", (e) => setActiveObject(e.selected[0]));
    fc.on("selection:cleared", () => setActiveObject(null));
    fc.on("mouse:down", handlePlaceholderClick);

    return () => { frontInitialized.current = false; fc.dispose(); frontCanvas.current = null; };
  }, [handlePlaceholderClick]);

  useEffect(() => {
    if (!isTshirt || !backRef.current || backInitialized.current) return;
    backInitialized.current = true;
    const bc = new fabric.Canvas(backRef.current, { width: canvasWidth, height: canvasHeight, backgroundColor: "#ffffff" });
    backCanvas.current = bc;
    setupMockup(bc, "/mockups/tshirt_back.png", bgColor);
    bc.on("selection:created", (e) => setActiveObject(e.selected[0]));
    bc.on("selection:updated", (e) => setActiveObject(e.selected[0]));
    bc.on("selection:cleared", () => setActiveObject(null));
    return () => { backInitialized.current = false; bc.dispose(); backCanvas.current = null; };
  }, [isTshirt]);

  useEffect(() => {
    if (frontCanvas.current) updateMockupColor(frontCanvas.current, bgColor);
    if (backCanvas.current) updateMockupColor(backCanvas.current, bgColor);
  }, [bgColor]);

  useEffect(() => {
    const target = activeSide === "front" ? frontCanvas.current : backCanvas.current;
    if (target) { setCanvas(target); target.discardActiveObject(); setActiveObject(null); target.renderAll(); }
  }, [activeSide, setCanvas, setActiveObject]);

  const addToCanvas = useCallback((side: TshirtSide | "current", obj: any) => {
    const target = side === "current" ? (activeSide === "front" ? frontCanvas.current : backCanvas.current) : side === "front" ? frontCanvas.current : backCanvas.current;
    if (!target) return;

    // Check for Placeholder first if it's an image
    if (obj.type === "image" || obj instanceof fabric.FabricImage) {
        // Search for placeholder cards OR specifically tagged text objects
        const placeholder = target.getObjects().find(o => {
            // If we have an active slot, use it exactly
            if (activeSlotRef.current && (o as any).name === activeSlotRef.current && !(o as any).hasImage) return true;
            // Otherwise find any empty placeholder
            if ((o as any).name?.startsWith("placeholder") && !(o as any).hasImage) return true;
            return false;
        });

        if (placeholder) {
            const scale = Math.max((placeholder.width || 100) / (obj.width || 100), (placeholder.height || 100) / (obj.height || 100));
            obj.set({
                left: placeholder.left,
                top: placeholder.top,
                scaleX: scale,
                scaleY: scale,
                angle: placeholder.angle,
                originX: "center", originY: "center",
                clipPath: placeholder instanceof fabric.Path ? placeholder : undefined,
                selectable: true
            });
            (placeholder as any).hasImage = true;
            
            // Hide the text/placeholder once filled
            placeholder.set("visible", false);

            target.add(obj);
            target.renderAll();
            return;
        }
    }

    obj.set({ left: (target.width || 0) / 2, top: (target.height || 0) / 2, originX: "center", originY: "center" });
    target.add(obj);
    target.setActiveObject(obj);
    target.renderAll();
    const targetSide = side === "current" ? activeSide : side;
    setActiveSide(targetSide);
    setCanvas(target);
    setActiveObject(obj);
  }, [activeSide, setActiveSide, setCanvas, setActiveObject]);

  useEffect(() => { setTriggerAddToCanvas(addToCanvas); }, [setTriggerAddToCanvas, addToCanvas]);

  const hasUserContent = (fc: fabric.Canvas): boolean => fc.getObjects().some(obj => (obj as any).name !== "productMockup" && !(obj as any).name?.startsWith("placeholder") && !(obj as any).name?.startsWith("label"));

  const exportDesign = useCallback(() => {
    const fc = frontCanvas.current; if (!fc) return;
    const frontUrl = fc.toDataURL({ multiplier: 2, format: "png", quality: 1 });
    const frontJson = JSON.stringify(fc.toJSON());
    if (isTshirt && backCanvas.current) {
      const backHasContent = hasUserContent(backCanvas.current);
      const backUrl = backCanvas.current.toDataURL({ multiplier: 2, format: "png", quality: 1 });
      const backJson = JSON.stringify(backCanvas.current.toJSON());
      onSave(frontUrl, frontJson, backUrl, backJson, backHasContent);
    } else { onSave(frontUrl, frontJson); }
  }, [isTshirt, onSave]);

  const previewDesign = useCallback(() => {
    const active = activeSide === "front" ? frontCanvas.current : backCanvas.current;
    if (!active) return;
    const dataUrl = active.toDataURL({ multiplier: 3, format: "png", quality: 1 });
    if (onPreview) onPreview(dataUrl);
  }, [activeSide, onPreview]);

  useEffect(() => { setTriggerExport(exportDesign); setTriggerPreview(previewDesign); }, [setTriggerExport, setTriggerPreview, exportDesign, previewDesign]);

  return (
    <div className="w-full h-full flex items-center justify-center relative bg-gray-50/50">
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${activeSide === "front" ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"}`}><canvas ref={frontRef} /></div>
      {isTshirt && <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${activeSide === "back" ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"}`}><canvas ref={backRef} /></div>}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleCanvasUpload} accept="image/*" />
    </div>
  );
};

