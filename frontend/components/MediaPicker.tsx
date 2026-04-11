"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Search, Upload, Loader2, CheckCircle2,
  Image as ImageIcon, LayoutGrid, List, Trash2,
  Upload as UploadIcon, Plus
} from "lucide-react";

interface MediaItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
}

export default function MediaPicker({
  onSelect,
  onClose,
  multiple = false,
  onSelectMultiple,
}: MediaPickerProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const MEDIA_BASE = API_URL.replace("/api", "");

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveUrl = (url: string) =>
    url.startsWith("http") ? url : `${MEDIA_BASE}${url}`;

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`);
      if (res.ok) setMedia(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    console.log(`[MediaPicker] Starting upload for ${e.target.files.length} files...`);

    for (const file of Array.from(e.target.files)) {
      const fd = new FormData();
      fd.append("image", file);
      
      console.log(`[MediaPicker] Uploading file: ${file.name} (${(file.size/1024).toFixed(1)} KB) to ${API_URL}/upload`);

      try {
        const res = await fetch(`${API_URL}/upload`, { 
            method: "POST", 
            body: fd,
            // Mode 'cors' is default but being explicit
            mode: 'cors'
        });
        
        if (res.ok) {
            console.log(`[MediaPicker] Upload SUCCESS: ${file.name}`);
            await fetchMedia();
        } else {
            const errorText = await res.text();
            console.error(`[MediaPicker] Upload FAILED: HTTP ${res.status} - ${errorText}`);
            alert(`Failed to upload ${file.name}: ${errorText || res.statusText}`);
        }
      } catch (err) {
        console.error(`[MediaPicker] Upload NETWORK ERROR:`, err);
        alert(`Network Error: Ensure backend is running at ${API_URL}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const toggleSelect = (url: string) => {
    if (!multiple) {
      setSelected([url]);
      return;
    }
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    if (multiple && onSelectMultiple) {
      onSelectMultiple(selected.map(resolveUrl));
    } else {
      onSelect(resolveUrl(selected[0]));
    }
    onClose();
  };

  const filtered = media.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#ff3f6c]/10 rounded-xl flex items-center justify-center">
              <ImageIcon size={16} className="text-[#ff3f6c]" />
            </div>
            <div>
              <h2 className="text-base  text-slate-900 capitalize tracking-widest leading-none">
                Media Library
              </h2>
              <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">
                {selected.length > 0
                  ? `${selected.length} item${selected.length > 1 ? "s" : ""} selected`
                  : "Select from your media vault"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload New */}
            <label className="h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-[12px]  capitalize tracking-widest">
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {uploading ? "Uploading..." : "Upload New"}
              <input
                type="file"
                multiple
                accept="image/*,.webp,.avif"
                className="hidden"
                onChange={handleUpload}
              />
            </label>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
              >
                <List size={14} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-8 py-3 border-b border-slate-50 bg-slate-50/50 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Filter assets by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-base font-medium outline-none focus:border-[#ff3f6c]/30 transition-all"
            />
          </div>
        </div>

        {/* Media Grid / List */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={36} className="animate-spin text-slate-200" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                <ImageIcon size={32} />
              </div>
              <p className="text-[12px]  capitalize tracking-widest">
                {media.length === 0 ? "No assets in vault yet" : "No results found"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {filtered.map((item) => {
                const isSelected = selected.includes(item.url);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleSelect(item.url)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-[#ff3f6c] shadow-lg shadow-pink-500/20 scale-[0.97]"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={resolveUrl(item.url)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#ff3f6c]/10 flex items-center justify-center">
                        <div className="w-7 h-7 bg-[#ff3f6c] rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    {/* Hover filename */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[12px] text-white font-medium capitalize truncate">
                        {item.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const isSelected = selected.includes(item.url);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleSelect(item.url)}
                    className={`w-full flex items-center gap-5 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-[#ff3f6c] bg-pink-50/30"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={resolveUrl(item.url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base  text-slate-900 capitalize truncate tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">
                        {(item.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#ff3f6c] rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
          <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest">
            {filtered.length} assets available
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-[12px]  capitalize tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={selected.length === 0}
              onClick={handleConfirm}
              className="px-8 py-2.5 bg-[#ff3f6c] text-white rounded-xl text-[12px]  capitalize tracking-widest disabled:opacity-30 hover:bg-[#ef2b5a] transition-all shadow-lg shadow-pink-500/20"
            >
              {multiple
                ? `Insert ${selected.length > 0 ? selected.length : ""} Asset${selected.length > 1 ? "s" : ""}`
                : "Insert Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
