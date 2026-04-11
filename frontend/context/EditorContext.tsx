"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useRef } from "react";
import * as fabric from "fabric";

export type TshirtSide = "front" | "back";

interface EditorContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  activeObject: fabric.FabricObject | null;
  setActiveObject: (obj: fabric.FabricObject | null) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  size: string;
  setSize: (size: string) => void;
  activeSide: TshirtSide;
  setActiveSide: (side: TshirtSide) => void;
  
  // Design & Step Management
  designs: any[];
  setDesigns: (designs: any[]) => void;
  activeDesign: any | null;
  setActiveDesign: (design: any | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  triggerExport: () => void;
  setTriggerExport: (fn: () => void) => void;
  triggerPreview: () => void;
  setTriggerPreview: (fn: () => void) => void;
  triggerSideSwitch: (side: TshirtSide) => void;
  setTriggerSideSwitch: (fn: (side: TshirtSide) => void) => void;
  triggerAddToCanvas: (side: TshirtSide | "current", obj: any) => void;
  setTriggerAddToCanvas: (fn: (side: TshirtSide | "current", obj: any) => void) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.FabricObject | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState("L");
  const [activeSide, setActiveSide] = useState<TshirtSide>("front");
  
  const [designs, setDesigns] = useState<any[]>([]);
  const [activeDesign, setActiveDesign] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("product");

  // Refs for callback functions — avoids infinite re-render loops
  const exportFnRef = useRef<(() => void) | null>(null);
  const previewFnRef = useRef<(() => void) | null>(null);
  const sideSwitchFnRef = useRef<((side: TshirtSide) => void) | null>(null);
  const addToCanvasFnRef = useRef<((side: TshirtSide | "current", obj: any) => void) | null>(null);

  const triggerExport = useCallback(() => { exportFnRef.current?.(); }, []);
  const triggerPreview = useCallback(() => { previewFnRef.current?.(); }, []);
  const triggerSideSwitch = useCallback((side: TshirtSide) => { sideSwitchFnRef.current?.(side); }, []);
  const triggerAddToCanvas = useCallback((side: TshirtSide | "current", obj: any) => { addToCanvasFnRef.current?.(side, obj); }, []);

  const setTriggerExport = useCallback((fn: () => void) => { exportFnRef.current = fn; }, []);
  const setTriggerPreview = useCallback((fn: () => void) => { previewFnRef.current = fn; }, []);
  const setTriggerSideSwitch = useCallback((fn: (side: TshirtSide) => void) => { sideSwitchFnRef.current = fn; }, []);
  const setTriggerAddToCanvas = useCallback((fn: (side: TshirtSide | "current", obj: any) => void) => { addToCanvasFnRef.current = fn; }, []);

  const value = useMemo(() => ({
    canvas, setCanvas, activeObject, setActiveObject,
    bgColor, setBgColor, size, setSize,
    activeSide, setActiveSide,
    designs, setDesigns, activeDesign, setActiveDesign,
    activeTab, setActiveTab,
    triggerExport, setTriggerExport,
    triggerPreview, setTriggerPreview,
    triggerSideSwitch, setTriggerSideSwitch,
    triggerAddToCanvas, setTriggerAddToCanvas,
  }), [
    canvas, activeObject, bgColor, size, activeSide,
    designs, activeDesign, activeTab,
    triggerExport, setTriggerExport,
    triggerPreview, setTriggerPreview,
    triggerSideSwitch, setTriggerSideSwitch,
    triggerAddToCanvas, setTriggerAddToCanvas,
  ]);

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within an EditorProvider");
  return context;
};
