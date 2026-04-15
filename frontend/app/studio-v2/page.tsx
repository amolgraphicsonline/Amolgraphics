"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Layout, Image as ImageIcon, ImagePlus, Sparkles, Type, Shapes, CloudUpload, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ShoppingCart, ZoomIn, ZoomOut, Maximize2, Trash2, Check, Truck, RotateCcw, RotateCw, History, Eye, Grid, Maximize, Settings2, Palette, Facebook, Twitter, Instagram, Youtube, Phone, MessageSquare, Star, Printer, Layers, StickyNote, Percent, X, Square, Hexagon, Circle, Heart, RectangleVertical, RectangleHorizontal, Loader2, Move, MinusCircle, PlusCircle, Edit as LucideEdit, Edit3, Copy, PenTool, Plus, LayoutGrid, ArrowRight, ShieldCheck, Zap, Cake, Plane, CalendarClock, MapPin, LayoutDashboard, Users, Baby, Handshake, Globe, Map, FileText, Book, Camera, ArrowLeft, Columns, FolderHeart } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { DesignCanvas, resolveMedia, TextState, IconState, PhotoState, Slot } from "@/components/studio/DesignCanvas";
import { CategoryBanner } from "@/components/ui/CategoryBanner";
import MediaPicker from "@/components/MediaPicker";
import PrintshoppyFooter from "@/components/ui/PrintshoppyFooter";
import StudioReviews from "@/components/studio/StudioReviews";
import StudioFaq from "@/components/studio/StudioFaq";

interface DesignOption {
  id: string;
  name: string;
  previewImage: string;
  photoCount: number;
  layoutJson?: any;
  category?: string;
  productId: string;
  priceAdjustment?: number;
  tags?: string;
  salesCount?: number;
  isPopular?: boolean;
}

export default function StudioV2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const categoryParam = searchParams.get('category') || "";
  const designIdParam = searchParams.get('designId');
  const shapeParam = searchParams.get('shape') || "";
  const frameCountParam = searchParams.get('frameCount');
  const { addToCart, cart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  type AlbumStep = 'selection' | 'config' | 'layout' | 'upload' | 'magic' | 'editor';
  const [activeTab, setActiveTab] = useState<'images' | 'layouts' | 'size' | 'designs' | 'options' | 'text' | 'theme' | null>('images');
  const [albumStep, setAlbumStep] = useState<AlbumStep>(designIdParam ? 'config' : 'selection');
  const [selectedPaper, setSelectedPaper] = useState('Premium Photo Paper');
  const [selectedAlbumLayout, setSelectedAlbumLayout] = useState('One Photo Per Page');

  const [uploadedPhotos, setUploadedPhotos] = useState<Record<number, PhotoState>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const ALBUM_MIN_PHOTOS = 3;
  const ALBUM_MAX_PHOTOS = 5;
  const [magicProgress, setMagicProgress] = useState(0);

  useEffect(() => {
    if (albumStep === 'magic') {
      const interval = setInterval(() => {
        setMagicProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // AUTO-ARRANGE LOGIC: Move galleryImages to uploadedPhotos slots
            setUploadedPhotos(prevPhotos => {
              const nextPhotos = { ...prevPhotos };
              galleryImages.forEach((url, i) => {
                if (!nextPhotos[i]) {
                  nextPhotos[i] = { url, scale: 1, x: 0, y: 0, rotate: 0 };
                }
              });
              return nextPhotos;
            });
            setTimeout(() => setAlbumStep('editor'), 800);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setMagicProgress(0);
    }
  }, [albumStep, galleryImages]);

  const [designs, setDesigns] = useState<DesignOption[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<DesignOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [texts, setTexts] = useState<TextState[]>([]);
  const [icons, setIcons] = useState<IconState[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleSavedMediaSelect = (urls: string[]) => {
    if (categoryParam === 'photo-album') {
      setGalleryImages(prev => {
        const newArr = [...prev, ...urls];
        return newArr.slice(0, ALBUM_MAX_PHOTOS);
      });
    } else {
      urls.forEach(url => addPhotoToFirstAvailableSlot(url));
    }
  };

  const [dynamicShapes, setDynamicShapes] = useState<any[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>(() => {
    if (shapeParam) return shapeParam;
    if (categoryParam === 'photo-album') return 'birthday';
    return "";
  });
  const [sizeOptions, setSizeOptions] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<any | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(productIdParam);
  const [activeProductData, setActiveProductData] = useState<any>(null);
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  
  // Auto-select 'birthday' theme for photo-albums if none selected
  useEffect(() => {
    if (categoryParam === 'photo-album' && !selectedShape) {
      setSelectedShape('birthday');
    }
  }, [categoryParam, selectedShape]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [designFilter, setDesignFilter] = useState<'all' | 'popular'>('all');
  const [categoryBanner, setCategoryBanner] = useState<string | null>(null);



  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const s = data.data ? { id: data.data.id, ...data.data.attributes } : data;
        setGlobalSettings(s);
      })
      .catch(console.error);
  }, [API_URL]);

  const [reviewsData, setReviewsData] = useState<any>(null);
  const [activeCategoryDetail, setActiveCategoryDetail] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);
  const [galleryIdx, setGalleryIdx] = useState<number>(0);
  const [tempFrameCount, setTempFrameCount] = useState<number>(frameCountParam ? parseInt(frameCountParam) : 5);
  const [singleEditIndex, setSingleEditIndex] = useState<number | null>(null);
  const [workingPhoto, setWorkingPhoto] = useState<PhotoState | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState<boolean>(false);
  const [activeGalleryOverlay, setActiveGalleryOverlay] = useState<'size' | 'shape' | 'border' | null>(null);
  const [borderColor, setBorderColor] = useState<string>('none');
  const [personalizationStage, setPersonalizationStage] = useState<'upload' | 'configure'>('upload');

  // Sync state with URL manually for fast back-button support
  useEffect(() => {
    setSelectedShape(shapeParam || "");
    const editParam = searchParams.get('singleEdit');
    if (editParam !== null) {
      const idx = parseInt(editParam);
      setSingleEditIndex(idx);
      setWorkingPhoto(uploadedPhotos[idx] || { url: '', scale: 1, x: 0, y: 0, rotate: 0 });
    } else {
      setSingleEditIndex(null);
      setWorkingPhoto(null);
    }
  }, [shapeParam, searchParams, uploadedPhotos]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [API_URL]);

  useEffect(() => {
    if (!categoryParam) return;
    fetch(`${API_URL}/categories?slug=${categoryParam}`)
      .then(res => res.ok ? res.json() : null)
      .then(cats => {
        const cat = Array.isArray(cats) ? cats.find((c: any) => c.slug === categoryParam) : cats;
        if (!cat) return;
        setActiveCategoryDetail(cat); // SAVE FULL CONFIG
        if (!activeProductId && cat.products?.[0]?.id) setActiveProductId(cat.products[0].id);
        else if (!activeProductId) {
          fetch(`${API_URL}/products?category=${cat.id}`).then(res => res.json()).then(prods => {
            if (prods.length > 0) setActiveProductId(prods[0].id);
          });
        }
        const shapeAttr = cat.categoryAttributes?.find((a: any) => {
          const name = a.name.toLowerCase();
          return name.includes("shape") || name.includes("variant") || name.includes("orientation") || name.includes("type");
        });
        if (shapeAttr?.attributeOptions) {
          setDynamicShapes(shapeAttr.attributeOptions.map((o: any) => ({
            id: o.value, label: o.displayValue || o.value, image: o.image
          })));
        } else if (categoryParam.includes('gallery')) {
          // Fallback mocks for Gallery if no attributes in DB
          setDynamicShapes([
            { id: 'landscape', label: 'Horizontal Landscape', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400' },
            { id: 'portrait', label: 'Vertical Portrait', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400' },
            { id: 'square', label: 'Classic Square', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400' },
            { id: 'hexagone', label: 'Hexagone', image: 'https://images.unsplash.com/photo-1583945321524-70498a54ede8?auto=format&fit=crop&q=80&w=400' }
          ]);
        }
      });

    // Fetch Category Banners
    fetch(`${API_URL}/banners`)
      .then(res => res.json())
      .then(data => {
        const blist = Array.isArray(data) ? data : [];
        const match = blist.find((b: any) =>
          b.category?.slug === categoryParam ||
          b.link?.includes(categoryParam) ||
          (b.metadata && b.metadata.category === categoryParam)
        );
        if (match) setCategoryBanner(match.image);
      }).catch(console.error);

  }, [categoryParam, API_URL, activeProductId]);

  useEffect(() => {
    if (!activeProductId) return;
    fetch(`${API_URL}/products/${activeProductId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        // Handle Strapi-style wrapping
        const product = data.data ? { id: data.data.id, ...data.data.attributes } : data;
        setActiveProductData(product);
      })
      .catch(console.error);
  }, [activeProductId, API_URL]);

  useEffect(() => {
    if (!activeProductData) return;
    const product = activeProductData;
    const allVariants = product.variants || product.product_variants || [];

    if (product.productType === "VARIABLE" && allVariants.length > 0) {
      const seenSizes = new Set<string>();
      const variantSizes: any[] = [];

      const matchesShape = (attrVal: string, target: string): boolean => {
        if (!attrVal || !target) return false;
        const a = attrVal.trim().toLowerCase();
        const t = target.trim().toLowerCase();
        if (a === t) return true;
        if (a.includes(t) || t.includes(a)) return true;
        if (t === 'landscape' && (a.includes('land') || a.includes('horiz'))) return true;
        if (t === 'portrait' && (a.includes('port') || a.includes('vert'))) return true;
        return false;
      };

      // Helper to extract attributes regardless of structure
      const getAttrs = (v: any) => {
        const raw = v.variantAttributes || v.attributes || [];
        return Array.isArray(raw) ? raw : (Object.entries(raw).map(([k, vVal]: [string, any]) => ({ name: k, value: vVal })));
      };

      // Check if product even HAS shape/orientation attributes
      const productHasShapeAttributes = allVariants.some((v: any) => {
        const attrs = getAttrs(v);
        return attrs.some((a: any) => {
          const n = (a.attributeName || a.name || "").toLowerCase();
          return n.includes("shape") || n.includes("variant") || n.includes("orientation");
        });
      });

      const shapeFiltered = (selectedShape && productHasShapeAttributes)
        ? allVariants.filter((v: any) => {
          const attrs = getAttrs(v);
          return attrs.some((a: any) => {
            const name = (a.attributeName || a.name || "").toLowerCase();
            const val = a.attributeValue || a.value || "";
            return (name.includes('shape') || name.includes('variant') || name.includes('orientation')) && matchesShape(val, selectedShape);
          });
        })
        : allVariants;

      // Final fallback: if shape filtering resulted in zero (e.g. no match found for specific shape), show all
      const source = (shapeFiltered.length === 0 && allVariants.length > 0) ? allVariants : shapeFiltered;
      source.forEach((v: any) => {
        const attrs = getAttrs(v);
        const sizeAttr = attrs.find((a: any) => {
          const n = (a.attributeName || a.name || "").toLowerCase();
          return n.includes("size") || n.includes("dimension") || n.includes("measure");
        });

        if (sizeAttr) {
          const sVal = sizeAttr.attributeValue || sizeAttr.value || "";
          const dimMatch = sVal.match(/(\d+)\s*[xX*]\s*(\d+)/);
          if (dimMatch) {
            let w = parseInt(dimMatch[1]);
            let h = parseInt(dimMatch[2]);
            let label = sVal;

            const target = (selectedShape || 'Portrait').toLowerCase();
            // Auto-swap orientation based on target shape
            if (target.includes('land') && w < h) {
              [w, h] = [h, w];
              label = `${w}X${h}`;
            } else if (target.includes('port') && h < w) {
              [w, h] = [h, w];
              label = `${w}X${h}`;
            }

            const standardizedLabel = label.toUpperCase().replace(/\s/g, '');
            if (!seenSizes.has(standardizedLabel)) {
              seenSizes.add(standardizedLabel);
              const thickAttr = attrs.find((a: any) => (a.attributeName || a.name || "").toLowerCase().includes("thickness"));
              const mountAttr = attrs.find((a: any) => (a.attributeName || a.name || "").toLowerCase().includes("mounting"));
              const thickness = thickAttr?.attributeValue || thickAttr?.value || "3 MM";
              const mounting = mountAttr?.attributeValue || mountAttr?.value || "Adhesive Tape (Included)";

              variantSizes.push({
                id: `vs-${standardizedLabel}`, label,
                width: w, height: h,
                price: v.salePrice || v.price || 0,
                thickness, mounting
              });
            }
          }
        }
      });
      setSizeOptions(variantSizes);
      if (!selectedSize && variantSizes.length > 0) setSelectedSize(variantSizes[0]);
    }
  }, [activeProductData, selectedShape]);

  // CATEGORY FALLBACK EFFECT: 100% CONFIGURATION DRIVEN
  useEffect(() => {
    if (sizeOptions.length > 0 || !activeCategoryDetail) return;

    // Try to find sizes from the active category config
    const findSizes = (catData: any) => {
      if (!catData?.categoryAttributes) return null;
      const attr = catData.categoryAttributes.find((a: any) => a.name.toLowerCase().includes("size"));
      return attr?.attributeOptions?.map((o: any) => o.value || o.displayValue) || null;
    };

    let finalValues = findSizes(activeCategoryDetail);

    // If still empty, check if we can inherit from parent
    if (!finalValues && activeCategoryDetail.parentId && categories.length) {
      const parent = categories.find(c => c.id === activeCategoryDetail.parentId);
      if (parent) finalValues = findSizes(parent);
    }

    if (finalValues) {
      let parsed = finalValues.map((v: any, idx: number) => {
        const valStr = typeof v === 'string' ? v : (v.value || v.displayValue || "");
        const dimMatch = valStr.match(/(\d+)\s*[xX*]\s*(\d+)/);
        let w = dimMatch ? parseInt(dimMatch[1]) : 12;
        let h = dimMatch ? parseInt(dimMatch[2]) : 12;
        let label = valStr;

        const target = (selectedShape || 'Portrait').toLowerCase();
        // Auto-swap orientation if dimensions don't match the target shape's logical expectation
        if (target.includes('land') && w < h) { [w, h] = [h, w]; label = `${w}X${h}`; }
        else if (target.includes('port') && h < w) { [w, h] = [h, w]; label = `${w}X${h}`; }

        return {
          id: `fallback-${idx}`, label,
          width: w, height: h, price: 499,
          thickness: '3 MM', mounting: 'Adhesive Tape (Included)'
        };
      });

      // --- SMART ORIENTATION FILTERING ---
      const targetShape = (selectedShape || 'Portrait').toLowerCase();
      parsed = parsed.filter((p: any) => {
        if (targetShape.includes('port')) return p.width < p.height;
        if (targetShape.includes('land')) return p.width > p.height;
        if (targetShape.includes('square')) return p.width === p.height;
        return true;
      });

      setSizeOptions(parsed);
      if (!selectedSize || !parsed.find((p: any) => p.label === selectedSize.label)) {
        if (parsed.length > 0) setSelectedSize(parsed[0]);
      }
    }
  }, [sizeOptions.length, categoryParam, selectedShape, categories]);

  useEffect(() => {
    if (!activeProductData) return;
    let price = 0;
    const designFee = selectedDesign?.priceAdjustment || 0;

    if (categoryParam.includes('gallery') && frameCountParam) {
      const count = parseInt(frameCountParam);
      if (count >= 20) price = 149;
      else if (count >= 10) price = 159;
      else if (count >= 5) price = 179;
      else if (count >= 2) price = 199;
      else price = 299;
    } else if (activeProductData.productType === "SIMPLE") {
      const baseVariant = activeProductData.variants?.find((v: any) => v.isDefault) || activeProductData.variants?.[0];
      price = baseVariant?.salePrice || baseVariant?.price || activeProductData.salePrice || activeProductData.regularPrice || 0;
    } else {
      let matchingVariant = activeProductData.variants?.find((v: any) => {
        let ms = true, mz = true;
        const attrs = v.variantAttributes || v.attributes || [];
        const sa = attrs.find((a: any) => {
          const n = (a.attributeName || a.name || "").toLowerCase();
          return n === "shape" || n === "variant" || n === "orientation";
        });
        if (sa && selectedShape) ms = (sa.attributeValue || sa.value || "").toLowerCase() === selectedShape.toLowerCase();
        const za = attrs.find((a: any) => (a.attributeName || a.name || "").toLowerCase().includes("size"));
        if (za && selectedSize) mz = (za.attributeValue || za.value || "").toLowerCase() === selectedSize.label.toLowerCase();
        return ms && mz;
      });
      if (!matchingVariant && selectedSize) {
        matchingVariant = activeProductData.variants?.find((v: any) => {
          const attrs = v.variantAttributes || v.attributes || [];
          return attrs.some((a: any) => (a.attributeName || a.name || "").toLowerCase().includes("size") && (a.attributeValue || a.value || "").toLowerCase() === selectedSize.label.toLowerCase());
        });
      }
      price = matchingVariant?.salePrice || matchingVariant?.price || selectedSize?.price || activeProductData.salePrice || activeProductData.regularPrice || 0;
    }
    setDisplayPrice(price + designFee);
  }, [activeProductData, selectedShape, selectedSize, selectedDesign, frameCountParam, categoryParam]);

  const { totalPrice, originalPrice, savings, totalFrames } = useMemo(() => {
    const frames = frameCountParam ? parseInt(frameCountParam) : 1;
    const total = displayPrice * frames;
    const original = (displayPrice + 100) * frames; // Premium markup for original price
    const save = original - total;
    return { totalPrice: total, originalPrice: original, savings: save, totalFrames: frames };
  }, [displayPrice, frameCountParam]);

  useEffect(() => {
    if (!categoryParam) return;
    setLoading(true);
    fetch(`${API_URL}/product-designs?category=${categoryParam}${selectedShape ? `&shape=${selectedShape}` : ''}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const designsList = Array.isArray(data) ? data : [];
        setDesigns(designsList);

        let target = designIdParam ? designsList.find(d => d.id === designIdParam) : null;

        if (!target && designIdParam) {
          // Fallback fetch: If the design isn't cleanly matching the exact API category/shape filter locally, fetch it globally!
          fetch(`${API_URL}/product-designs/${designIdParam}`)
            .then(rt => rt.ok ? rt.json() : null)
            .then(dt => {
              if (dt && dt.id) {
                setDesigns(prev => {
                  if (!prev.find(x => x.id === dt.id)) return [...prev, dt];
                  return prev;
                });
                setSelectedDesign(dt);
              } else {
                setSelectedDesign(designsList.length > 0 ? designsList[0] : { id: 'custom-fallback', name: 'Custom Photo Print', previewImage: '', photoCount: 1, productId: activeProductId || '' });
              }
              setLoading(false);
            })
            .catch(() => {
              setSelectedDesign(designsList.length > 0 ? designsList[0] : { id: 'custom-fallback', name: 'Custom Photo Print', previewImage: '', photoCount: 1, productId: activeProductId || '' });
              setLoading(false);
            });
          return;
        }

        if (designsList.length > 0) {
          setSelectedDesign(target || designsList[0]);
        } else {
          setSelectedDesign({
            id: 'custom-fallback',
            name: 'Custom Photo Print',
            previewImage: '',
            photoCount: 1,
            productId: activeProductId || ''
          });
        }
        setLoading(false);
      })
      .catch(() => { setDesigns([]); setLoading(false); });
  }, [categoryParam, selectedShape, API_URL]);

  useEffect(() => {
    fetch(`${API_URL}/reviews`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setReviewsData(data); })
      .catch(err => console.error("Error fetching reviews:", err));
  }, [API_URL]);

  useEffect(() => {
    if (selectedDesign?.productId && selectedDesign.productId !== activeProductId) {
      setActiveProductId(selectedDesign.productId);
      setSelectedSize(null);
    }
  }, [selectedDesign, activeProductId]);

  const handlePhotoUpload = async (idx: number, urlOrFile: string | File, init?: Partial<PhotoState>) => {
    if (!urlOrFile) {
      const newPhotos = { ...uploadedPhotos };
      delete newPhotos[idx];
      setUploadedPhotos(newPhotos);
      return;
    }
    let url = typeof urlOrFile === 'string' ? urlOrFile : '';
    if (urlOrFile instanceof File) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", urlOrFile);
      try {
        const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          url = data.url;
          setGalleryImages(prev => [url, ...prev]);
        }
      } catch (err) { console.error(err); return; }
      finally { setIsUploading(false); }
    }
    if (!url) return;
    setUploadedPhotos(prev => ({
      ...prev,
      [idx]: {
        url, scale: init?.scale || 0.8, x: init?.x || 0, y: init?.y || 0, rotate: init?.rotate || 0, ...init
      }
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('files' in e.target && e.target.files) {
      files = e.target.files;
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      files = e.dataTransfer.files;
    }

    if (!files || files.length === 0) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (categoryParam === 'photo-album') {
            setGalleryImages(prev => {
              if (prev.length >= ALBUM_MAX_PHOTOS) return prev;
              return [...prev, data.url];
            });
          } else {
            addPhotoToFirstAvailableSlot(data.url);
          }
        }
      } catch (err) { console.error(err); }
    }
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(e);
  };

  const addPhotoToFirstAvailableSlot = (url: string) => {
    const galleryCount = frameCountParam ? parseInt(frameCountParam) : 0;
    const required = galleryCount > 0 ? galleryCount : (selectedDesign?.photoCount || 1);
    setUploadedPhotos(prev => {
      const activeSlots = Object.keys(prev).map(Number);
      for (let i = 0; i < required; i++) {
        if (!activeSlots.includes(i)) return { ...prev, [i]: { url, scale: 1, x: 0, y: 0, rotate: 0 } };
      }
      return { ...prev, [0]: { url, scale: 1, x: 0, y: 0, rotate: 0 } };
    });
  };

  const photoStats = useMemo(() => {
    const uploaded = Object.keys(uploadedPhotos).length;
    const isAlbum = categoryParam === 'photo-album';
    const min = isAlbum ? 25 : (activeProductData?.minPhotos || 0);
    const max = isAlbum ? 100 : (activeProductData?.maxPhotos || 0);
    const galleryCount = frameCountParam ? parseInt(frameCountParam) : 0;
    const required = galleryCount > 0 ? galleryCount : (min > 0 ? min : (selectedDesign?.photoCount || 1));
    return { uploaded, required, isDone: uploaded >= required, isAlbum, min, max };
  }, [uploadedPhotos, selectedDesign, activeProductData, frameCountParam, categoryParam]);

  const handleAddToCart = async () => {
    if (isCapturing) return;
    if (!selectedSize) {
      if (sizeOptions.length > 0) {
        setActiveGalleryOverlay('size');
        alert(`Please select an ${categoryParam === 'photo-album' ? 'Album' : 'Frame'} Size before adding to cart.`);
      } else {
        alert("Configuration Error: No sizes found. Please select a theme first.");
      }
      return;
    }
    if (categoryParam !== 'photo-album' && !selectedShape) return alert("Please select a theme/shape.");

    if (categoryParam === 'photo-album') {
      const count = Object.keys(uploadedPhotos).length;
      if (count < ALBUM_MIN_PHOTOS) return alert(`Each album required min ${ALBUM_MIN_PHOTOS} images to upload. Please upload more.`);
      if (count > ALBUM_MAX_PHOTOS) return alert(`Each album supports max ${ALBUM_MAX_PHOTOS} images. Please remove some.`);
    } else {
      if (photoStats.uploaded < photoStats.required) return alert(`Please upload at least ${photoStats.required} photo(s).`);
    }

    setIsCapturing(true);
    const finalProductId = activeProductId || selectedDesign?.productId || `prod_${categoryParam}`;
    const uniqueId = `opt-${Date.now()}`;
    let captureImage = resolveMedia(selectedDesign?.previewImage, API_URL) || "";

    try {
      await new Promise(r => setTimeout(r, 300));
      const element = document.getElementById("studio-canvas-capture");
      if (element) {
        const html2canvas = (await import("html2canvas")).default;
        const canvasObj = await html2canvas(element, { useCORS: true, logging: false, scale: 2, backgroundColor: '#ffffff' });
        captureImage = canvasObj.toDataURL("image/jpeg", 0.8) || captureImage;
      }
    } catch (e) { }

    const designData = {
      designId: selectedDesign?.id,
      photos: uploadedPhotos,
      frameCount: Object.keys(uploadedPhotos).length, // Represents total photos / pages for albums
      shape: selectedShape,
      border: borderColor,
      size: selectedSize,
      paper: selectedPaper, // For custom photobooks
      lamination: 'Photo Gloss', // As requested via default lamination mapping
    };

    addToCart({
      id: uniqueId,
      productId: finalProductId,
      name: categoryParam.includes('gallery') ? `Acrylic Photo Print Gallery Set (${totalFrames} Frames)` : `Custom Acrylic Photo Print`,
      price: displayPrice,
      printingCharge: 0,
      image: Object.values(uploadedPhotos)[0]?.url || "",
      quantity: totalFrames,
      size: selectedSize.label,
      variantName: selectedShape,
      designJson: JSON.stringify(designData)
    });
    setIsCapturing(false);
    router.push('/cart');
  };

  const handleDeleteFrame = (idx: number) => {
    const total = parseInt(frameCountParam || "1");
    if (total <= 1) return; // Don't delete last frame
    const newPhotos: any = {};
    let offset = 0;
    for (let i = 0; i < total; i++) {
      if (i === idx) {
        offset = 1;
        continue;
      }
      if (uploadedPhotos[i]) newPhotos[i - offset] = uploadedPhotos[i];
    }
    setUploadedPhotos(newPhotos);
    pushQuery(selectedShape, designIdParam, total - 1);
  };

  const handleCopyFrame = (idx: number) => {
    const total = parseInt(frameCountParam || "1");
    const source = uploadedPhotos[idx];
    if (source) {
      setUploadedPhotos(prev => ({ ...prev, [total]: { ...source } }));
    }
    pushQuery(selectedShape, designIdParam, total + 1);
  };

  const pushQuery = (newShape: string | null | undefined, newDesignId?: string | null | undefined, newFrameCount?: number, singleEditIdx?: number) => {
    let url = `/studio-v2?category=${categoryParam}`;
    if (newShape) url += `&shape=${newShape}`;
    if (newFrameCount !== undefined) url += `&frameCount=${newFrameCount}`;
    else if (frameCountParam) url += `&frameCount=${frameCountParam}`;
    if (newDesignId) url += `&designId=${newDesignId}`;
    if (singleEditIdx !== undefined) url += `&singleEdit=${singleEditIdx}`;
    router.push(url);
  };

  // --- VIEWS ---

  // VIEW 1: SHAPES LANDING (No Shape Selected)
  if ((!shapeParam || categoryParam === 'photo-album') && (dynamicShapes.length > 0 || categoryParam.includes('gallery') || categoryParam === 'photo-album')) {
    const fallbackBanner = categories.find(c => c.slug === categoryParam)?.image;

    return (
      <div className="bg-white min-h-screen">
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">

          {/* 1. HERO BANNER CONTAINER */}
          <CategoryBanner
            categoryId={categories.find(c => c.slug === categoryParam || c.name === categoryParam || (categoryParam.includes('gallery') && c.slug.includes('gallery')))?.id}
            showButton={false}
          />

          {categoryParam.includes('gallery') && (
            <>
              {/* 1.1 HIGHLIGHTS SECTION */}
              <div className="max-w-[1240px] mx-auto mb-10 py-8 border-b border-slate-100">
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="bg-slate-900 text-white p-1 rounded-md shadow-lg shadow-slate-900/10">
                    <Star fill="white" size={16} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-widest uppercase">HIGHLIGHTS</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                      <Printer className="text-[#1877F2]" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">Exceptional Print Quality</h3>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">True-to-life print quality that doesn't fade</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group">
                    <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
                      <Shapes className="text-orange-500" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">6 Unique Shapes</h3>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">Comes in square, circle, love & hexagon shapes</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group">
                    <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                      <Layers className="text-purple-500" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">Highly Reflective</h3>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">Just like a glass but more durable than glass</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group">
                    <div className="p-3 bg-teal-50 rounded-2xl group-hover:bg-teal-100 transition-colors">
                      <StickyNote className="text-teal-600" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">Hassle Free Install</h3>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">No nails needed, just peel and stick</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 group">
                    <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                      <Truck className="text-green-600" size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">Free Shipping</h3>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">We ship all over India at no additional cost</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.2 SHAPE SELECTION - GALLERY */}
              <div className="max-w-[1300px] mx-auto mb-10 px-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight mb-1 uppercase">
                    PHOTO GALLERY SETS
                  </h2>
                  <p className="text-slate-500 font-medium text-base max-w-2xl mx-auto">
                    Simple. Elegant. Available in 6 classic shapes and multiple sizes.
                  </p>
                </div>
                <div className="relative mb-12">
                  <div id="shape-scroll-container-gal" className="flex overflow-x-auto no-scrollbar gap-6 md:gap-8 py-8 px-4 scroll-smooth">
                    {dynamicShapes.map(s => (
                      <button key={s.id} onClick={() => pushQuery(s.id)} className="group flex flex-col items-center shrink-0 w-[220px] md:w-[280px]">
                        <div className="w-full aspect-square bg-white rounded-[32px] overflow-hidden mb-5 shadow-2xl shadow-slate-200/50 transition-all relative border-[8px] border-white group-hover:border-[#1877F2] group-hover:scale-105 group-hover:rotate-1">
                          {s.image ? (
                            <img src={resolveMedia(s.image, API_URL)} className="w-full h-full object-cover transition-transform duration-700" alt={s.label} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50"><Shapes size={60} className="group-hover:text-[#1877F2] transition-colors" /></div>
                          )}
                        </div>
                        <h4 className="text-xl font-black text-slate-900 capitalize tracking-tighter group-hover:text-[#1877F2] transition-colors">{s.label}</h4>
                      </button>
                    ))}
                  </div>

                  {dynamicShapes.length > 5 && (
                    <>
                      <button
                        onClick={() => {
                          const el = document.getElementById('shape-scroll-container-gal');
                          if (el) el.scrollBy({ left: -210, behavior: 'smooth' });
                        }}
                        className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 hidden md:flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-slate-900 z-10"
                      >
                        <ChevronLeft size={24} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById('shape-scroll-container-gal');
                          if (el) el.scrollBy({ left: 210, behavior: 'smooth' });
                        }}
                        className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 hidden md:flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-slate-900 z-10"
                      >
                        <ChevronRight size={24} strokeWidth={3} />
                      </button>
                    </>
                  )}
                </div>
              </div>

                <div className="flex flex-col items-center justify-center mt-2">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
                    Click on Image to Select Shape
                  </p>
                </div>

              {/* 1.4 QUANTITY PRICING SECTION */}
              <div className="max-w-[1240px] mx-auto mb-16">
                <div className="flex flex-col items-center justify-center text-center space-y-5">
                  <div className="flex items-center gap-3 py-3 border-b border-slate-100 w-full justify-center">
                    <span className="text-lg md:text-xl font-bold text-slate-700">1 photo Frame @ <span className="text-[#1877F2] font-black">₹ 299/-</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1877F2]">
                    <div className="p-1.5 bg-blue-50 rounded-full shadow-sm">
                      <Percent size={20} strokeWidth={3} />
                    </div>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">BUY MORE, SAVE MORE</h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
                    <div className="bg-[#EAF5FF] p-5 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all group border border-blue-100/50 hover:-translate-y-0.5">
                      <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest mb-1">Starter Pack</span>
                      <span className="text-xs md:text-sm font-bold text-slate-600 text-center leading-tight">Buy 2 to 4 Frames @<br /><span className="text-slate-900 font-black text-lg">₹ 199/-</span><br /><span className="text-[9px] uppercase">Per Frame</span></span>
                    </div>
                    <div className="relative bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all group border-2 border-blue-500/20 hover:-translate-y-0.5">
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1877F2] text-white text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-blue-500/20 z-10">Best Value</div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Standard Set</span>
                      <span className="text-xs md:text-sm font-bold text-slate-600 text-center leading-tight">Buy 5 to 9 Frames @<br /><span className="text-[#1877F2] font-black text-lg">₹ 179/-</span><br /><span className="text-[9px] uppercase">Per Frame</span></span>
                    </div>
                    <div className="bg-[#EAF5FF] p-5 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all group border border-blue-100/50 hover:-translate-y-0.5">
                      <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest mb-1">Family Pack</span>
                      <span className="text-xs md:text-sm font-bold text-slate-600 text-center leading-tight">Buy 10 to 19 Frames @<br /><span className="text-slate-900 font-black text-lg">₹ 159/-</span><br /><span className="text-[9px] uppercase">Per Frame</span></span>
                    </div>
                    <div className="bg-[#EAF5FF] p-5 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all group border border-blue-100/50 hover:-translate-y-0.5">
                      <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest mb-1">Bulk Order</span>
                      <span className="text-xs md:text-sm font-bold text-slate-600 text-center leading-tight">Buy 20 & above @<br /><span className="text-slate-900 font-black text-lg">₹ 149/-</span><br /><span className="text-[9px] uppercase">Per Frame</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 1.5 FRIDGE MAGNET SPECIFIC LANDING PAGE */}
          {categoryParam.includes('magnet') && (
            <div className="max-w-[1400px] mx-auto mb-20 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
                {/* Left: Product Feature Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50 border-[12px] border-white group">
                    <img
                      src="https://images.unsplash.com/photo-1590483734724-38fa197a1980?auto=format&fit=crop&q=80&w=1200"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      alt="Acrylic Fridge Magnet"
                    />
                  </div>
                </div>

                {/* Right: Pricing & Quick Start */}
                <div className="space-y-8 pt-4">
                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                      ACRYLIC FRIDGE <span className="text-[#1877F2]">MAGNETS</span>
                    </h1>
                    <div className="h-1.5 w-24 bg-[#1877F2] rounded-full" />
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                    {/* Pricing Tiers */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                        <span className="text-xl font-black text-slate-900">₹ 149/-</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Each</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-3xl border-2 border-[#1877F2]/20 flex flex-col items-center text-center relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#1877F2] text-white text-[7px] font-black px-3 py-0.5 rounded-full uppercase">Value</div>
                        <span className="text-xl font-black text-[#1877F2]">₹ 129/-</span>
                        <span className="text-[10px] font-bold text-[#1877F2] uppercase tracking-widest mt-1">5+ Qty</span>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                        <span className="text-xl font-black text-slate-900">₹ 119/-</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">10+ Qty</span>
                      </div>
                    </div>

                    {/* Quick Start Card */}
                    <div className="border-[3px] border-[#1877F2]/10 rounded-[2rem] p-6 bg-slate-50/50 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Select Shape & Style</span>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">Premium Acrylic</span>
                      </div>
                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-inner flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                          <button onClick={() => pushQuery('Square', null, 1)} className="w-full h-14 bg-[#1877F2] hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                            <CloudUpload size={20} strokeWidth={3} /> Upload Photos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-3 bg-white rounded-xl shadow-sm"><Zap className="text-amber-500" size={24} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Strong Magnet</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Industrial Grade</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck className="text-emerald-500" size={24} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wide">3MM Acrylic</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scratch Resistant</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* High Density Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center group hover:border-[#1877F2]/30 transition-all">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform"><Printer size={40} /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Crystal Print</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">High-definition pigment printing that brings your memories to life with incredible vibrance and detail.</p>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center group hover:border-[#1877F2]/30 transition-all">
                  <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><Zap size={40} strokeWidth={2.5} /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Strong Grip</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">Integrated industrial-strength magnets ensure your photos stay securely on any magnetic surface.</p>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center group hover:border-[#1877F2]/30 transition-all">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ShieldCheck size={40} /></div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Ultra Durable</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">3MM thickness provides excellent rigidity while remaining lightweight and resistant to scratches.</p>
                </div>
              </div>
            </div>
          )}

          {categoryParam === 'photo-album' && (
            <div className="max-w-[1400px] mx-auto mb-20 px-4 md:px-8">
              {/* STEP 1: DESIGN SELECTION */}
              {albumStep === 'selection' && (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase italic">
                      PHOTO ALBUM <span className="text-[#1877F2]">DESIGNS</span>
                    </h2>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10 mb-12">
                    <div className="flex flex-col xl:flex-row gap-10 items-start">
                      <div className="xl:pt-4 flex flex-col items-center xl:items-start shrink-0">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-2">CHOOSE THEME</h3>
                        <div className="text-slate-900 flex flex-col items-center">
                          <div className="h-[2px] w-12 bg-slate-900 mb-1"></div>
                          <ArrowRight size={24} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {[
                            { id: 'birthday', label: 'Birthday', icon: Cake },
                            { id: 'international-travel', label: 'International Travel', icon: Globe },
                            { id: 'life-events', label: 'Life Events', icon: Book },
                            { id: 'national-travel', label: 'National Travel', icon: Map },
                            { id: 'you-and-me', label: 'You & Me', icon: Heart },
                            { id: 'general', label: 'General', icon: FileText },
                            { id: 'family', label: 'Family', icon: Users },
                            { id: 'kids-and-babies', label: 'Kids & Babies', icon: Baby },
                            { id: 'wedding', label: 'Wedding', icon: Handshake }
                          ].map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => {
                                setSelectedShape(theme.id);
                                pushQuery(theme.id);
                              }}
                              className={`flex items-center gap-4 px-5 py-4 rounded-lg border transition-all text-left group
                                ${selectedShape === theme.id
                                  ? 'border-[#416D5A] bg-[#E8EEEB] text-[#416D5A] ring-1 ring-[#416D5A]'
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 shadow-sm'}`}
                            >
                              <div className={`shrink-0 ${selectedShape === theme.id ? 'text-[#416D5A]' : 'text-slate-600'}`}>
                                <theme.icon size={22} strokeWidth={1.5} />
                              </div>
                              <span className="font-bold text-[13px] uppercase tracking-tighter leading-tight">{theme.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                    {designs.length > 0 ? designs.map((design: any) => (
                      <div key={design.id} className="group flex flex-col">
                        <div className="relative aspect-[3/2] bg-[#f8fafc] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-xl transition-all mb-4">
                          <img src={resolveMedia(design.previewImage, API_URL)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={design.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDesign(design);
                            setAlbumStep('config');
                          }}
                          className="w-full h-12 bg-[#D1EBFF] hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-between px-6 transition-all active:scale-95 group/btn"
                        >
                          SELECT DESIGN <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <LayoutGrid size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">No designs found for this theme</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2: CONFIGURATION (SIZE/PAPER) - FROM SCREENSHOT 1 */}
              {albumStep === 'config' && (
                <div className="max-w-6xl mx-auto py-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Preview */}
                    <div className="space-y-6">
                      <div className="aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                        <img
                          src={resolveMedia(selectedDesign?.previewImage, API_URL)}
                          className="w-full h-full object-cover"
                          alt="Album Preview"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                            <img src={resolveMedia(selectedDesign?.previewImage, API_URL)} className="w-full h-full object-cover opacity-60" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Options */}
                    <div className="space-y-10">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">PHOTO ALBUM</h2>
                        <div className="h-1.5 w-24 bg-[#1877F2] rounded-full" />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-black text-[#1877F2] uppercase tracking-widest">Size (Inches)</label>
                          <select className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none shadow-sm">
                            <option>A4 (12 x 9) Horizontal Book</option>
                            <option>A5 (8 x 6) Horizontal Book</option>
                            <option>Square (10 x 10) Large</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-black text-slate-800 uppercase tracking-widest">Paper</label>
                          <select
                            value={selectedPaper}
                            onChange={(e) => setSelectedPaper(e.target.value)}
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none shadow-sm"
                          >
                            <option>Premium Photo Paper</option>
                            <option>Non Tearable Paper</option>
                          </select>
                        </div>

                        <div className="bg-[#FFF5F5] border border-red-100 rounded-2xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-slate-900">Glossy Lamination</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">On Hard Cover and All Pages</p>
                          </div>
                          <div className="bg-[#FF4D4D] text-white font-black px-4 py-2 rounded-lg text-sm uppercase rotate-12 shadow-lg">FREE</div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        </div>

                        <div className="flex items-baseline gap-4 pt-4">
                          <span className="text-2xl text-slate-300 font-bold line-through">₹1,999</span>
                          <span className="text-6xl font-black text-slate-900 tracking-tighter">₹999</span>
                          <span className="text-sm font-bold text-slate-400 uppercase">Free Shipping</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">(Only ₹30 For Each Additional Page)</p>

                        <button
                          onClick={() => setAlbumStep('layout')}
                          className="w-full h-16 bg-[#FF6B35] hover:bg-[#F25C22] text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          START DESIGN <ArrowRight size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LAYOUT SELECTION - FROM SCREENSHOT 2 */}
              {albumStep === 'layout' && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Choose Your Layout</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select how you'd like your photos arranged</p>
                      </div>
                      <button onClick={() => setAlbumStep('config')} className="p-3 hover:bg-slate-50 rounded-full text-slate-400"><X size={24} /></button>
                    </div>

                    <div className="p-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { id: 'More Photos', label: 'More Photos', sub: '3-4 photos per page for maximum memories', image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400" },
                          { id: 'Balanced', label: 'Balanced', sub: '1-2 photos per page for the perfect mix', image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400" },
                          { id: 'One Photo Per Page', label: 'One Photo Per Page', sub: 'Single photo per page for stunning focus', image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=400" }
                        ].map(layout => (
                          <button
                            key={layout.id}
                            onClick={() => setSelectedAlbumLayout(layout.id)}
                            className={`flex flex-col items-center text-center p-6 rounded-[2.5rem] border-4 transition-all group
                              ${selectedAlbumLayout === layout.id ? 'border-[#1877F2] bg-blue-50/50 shadow-xl' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                          >
                            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-sm">
                              <img src={layout.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={layout.label} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic mb-2">{layout.label}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">{layout.sub}</p>
                          </button>
                        ))}
                      </div>

                      <div className="mt-12">
                        <button
                          onClick={() => setAlbumStep('upload')}
                          className="w-full h-16 bg-[#1877F2] hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: UPLOAD TYPE (PRINTSHOPPY STYLE) */}
              {albumStep === 'upload' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FA] animate-in fade-in duration-500">
                  {galleryImages.length === 0 ? (
                    /* Initial Upload Choice View */
                    <div className="max-w-7xl mx-auto py-24 px-6 w-full">
                      <div className="flex flex-col md:flex-row gap-0 items-stretch bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100">
                        {/* ... Existing Left/Right choice logic I'll keep but refine ... */}
                        <div className="flex-[1.2] p-16 border-r border-slate-100 flex flex-col items-center text-center space-y-12 bg-gradient-to-br from-white to-slate-50/30">
                          <div className="space-y-4">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Smart Photo Book</h2>
                            <p className="text-sm font-bold text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                              Upload photos, review created proposition, focus on making it truly yours.
                            </p>
                          </div>
                          <div className="w-full max-w-md space-y-6">
                            <div className="space-y-3">
                              <input type="file" ref={fileInputRef} onChange={handleUpload} multiple accept="image/*" className="hidden" />
                              <button onClick={() => fileInputRef.current?.click()} className="w-full h-20 bg-[#FF6B35] hover:bg-[#F25C22] text-white rounded-xl font-black uppercase tracking-widest text-xl shadow-2xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-4">
                                <Plus size={32} strokeWidth={3} /> Add Photos
                              </button>
                              <button onClick={() => { setShowMediaPicker(true); setActiveTab('images'); }} className="w-full h-14 bg-white border-2 border-slate-100 hover:border-[#1877F2] hover:text-[#1877F2] text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3">
                                <FolderHeart size={18} /> From Saved Media
                              </button>
                            </div>
                            <div onDragOver={handleDragOver} onDrop={handleDrop} className="w-full h-40 border-2 border-dashed border-[#FF6B35]/20 rounded-2xl flex flex-col items-center justify-center bg-[#FF6B35]/5 group/drop transition-all hover:bg-[#FF6B35]/10">
                              <CloudUpload size={36} className="text-[#FF6B35] mb-3 opacity-60" />
                              <span className="text-xs font-black text-[#FF6B35] uppercase tracking-widest">or drag & drop them here</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 p-16 flex flex-col items-center justify-center text-center space-y-12 bg-white">
                          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Manual Book</h2>
                          <button onClick={() => setAlbumStep('editor')} className="w-full max-w-xs h-16 border-2 border-[#FF6B35]/30 text-[#FF6B35] hover:bg-orange-50 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3">
                            Go to editor <ChevronRight size={22} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* "ALL SET?" GRID VIEW - CLONED FROM IMAGE 1 */
                    <div className="flex-1 flex overflow-hidden">
                      {/* Left Side: Photo Grid */}
                      <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {galleryImages.map((img, i) => (
                            <div key={i} className="aspect-square bg-white rounded shadow-sm border border-slate-100 p-1 relative group hover:shadow-xl transition-all">
                              <img src={resolveMedia(img, API_URL)} className="w-full h-full object-cover" />
                              <div className="absolute bottom-1 right-1 bg-white/90 px-1 font-bold text-[8px] border border-slate-100 text-slate-400">1</div>
                              <button
                                onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Side: Action Sidebar */}
                      <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
                        <div className="p-12 flex flex-col items-center text-center space-y-12 flex-1">
                          <div className="space-y-4">
                            <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-none">All set?</h2>
                            <p className="text-sm font-bold text-slate-400">Don't wait for photos to finish uploading.</p>
                          </div>

                          <div className="w-full max-w-sm">
                            {/* Green Add More Box */}
                            <label className="block w-full border-2 border-dashed border-[#2CB9B0] rounded-xl p-8 hover:bg-[#2CB9B0]/5 transition-all cursor-pointer group">
                              <input type="file" multiple onChange={handleUpload} className="hidden" />
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#2CB9B0]/10 flex items-center justify-center text-[#2CB9B0] transition-transform group-hover:scale-110">
                                  <ImagePlus size={28} />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-black text-[#2CB9B0] uppercase text-sm">Add more photos</p>
                                  <p className="text-[10px] text-[#2CB9B0] font-bold">Drag and drop or click to add photos from another source.</p>
                                </div>
                              </div>
                            </label>

                            <div className="mt-12 space-y-8">
                              <p className="font-black text-slate-900 uppercase text-xs">Let us create a proposition for you.</p>
                              <button
                                onClick={() => setAlbumStep('magic')}
                                className="w-full h-20 bg-[#FF6B35] hover:bg-[#F25C22] text-white rounded-xl font-black uppercase tracking-widest text-xl shadow-2xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-4"
                              >
                                Do the magic <ChevronRight size={28} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Footer Link */}
                        <div className="p-8 border-t border-slate-50 text-center">
                          <button onClick={() => setAlbumStep('editor')} className="text-slate-400 font-bold text-sm hover:underline italic">
                            or make it all on your own
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: MAGIC PROGRESS VIEW */}
              {albumStep === 'magic' && (
                <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8">
                  <div className="space-y-12 text-center max-w-xl w-full">
                    <div className="relative w-48 h-48 mx-auto">
                      {/* Outer Ring */}
                      <div className="absolute inset-0 rounded-full border-8 border-slate-50" />
                      <div
                        className="absolute inset-0 rounded-full border-8 border-[#1877F2] border-t-transparent animate-spin"
                        style={{ animationDuration: '3s' }}
                      />
                      {/* Inner Content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={64} className="text-[#1877F2] animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Doing the magic...</h2>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">We are arranging your memories perfectly</p>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-[#1877F2] to-blue-400 transition-all duration-300"
                        style={{ width: `${magicProgress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center px-4">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{magicProgress < 30 ? 'Analyzing Photos' : magicProgress < 60 ? 'Generating Layout' : magicProgress < 90 ? 'Optimizing Story' : 'Finishing Touches'}</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">{magicProgress}%</span>
                    </div>
                  </div>
                </div>
              )}


              {/* STEP 6: ELEGANT & COMPACT EDITOR */}
              {albumStep === 'editor' && (
                    <div className="fixed inset-0 z-[150] bg-[#f8f9fa] flex flex-col overflow-hidden animate-in fade-in duration-500">
                      {/* Ultra-Slim Header */}
                      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-[100] shadow-sm">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => {
                              if (confirm('Go back to upload? Your current layout will be saved.')) {
                                setAlbumStep('upload');
                              }
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
                          >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
                          </button>
                          <div className="h-4 w-px bg-slate-200" />
                          <div className="text-base font-black text-slate-900 tracking-tighter uppercase italic">
                            Amol <span className="text-[#1877F2]">Graphics</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-10">
                          <div className="hidden lg:flex items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                            <button className="flex items-center gap-2 hover:text-[#1877F2] transition-colors"><History size={14} /> History</button>
                            <button className="flex items-center gap-2 hover:text-[#1877F2] transition-colors" onClick={() => alert('Project Settings Coming Soon')}><Settings2 size={14} /> Project</button>
                          </div>

                          <div className="text-center">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Photobook {selectedDesign?.id?.slice(-5) || '18508'}</h3>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Auto-saved 2m ago</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => alert('Project Saved Locally!')}
                              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#1877F2] transition-colors"
                            >
                              <Printer size={18} />
                              <span className="text-[7px] font-black uppercase tracking-widest">Save</span>
                            </button>
                            <button className="flex flex-col items-center gap-0.5 text-[#FF6B35]">
                              <LucideEdit size={18} />
                              <span className="text-[7px] font-black uppercase tracking-widest">Edit</span>
                            </button>
                            <button
                              onClick={handleAddToCart}
                              className="h-10 px-8 bg-[#FF6B35] hover:bg-[#F25C22] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-3 ml-2"
                            >
                              Add To Cart <span className="font-bold opacity-80">₹999</span>
                            </button>
                          </div>
                        </div>
                      </header>

                      {/* High-Elegance Workbench */}
                      <div className="flex-1 flex overflow-hidden">
                        {/* Slim Side Navigation */}
                        <aside className="w-16 bg-white border-r border-slate-50 flex flex-col items-center py-6 gap-8 text-slate-400 z-50">
                          <button className="flex flex-col items-center gap-1 hover:text-[#1877F2] group"><Search size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[7px] font-black uppercase tracking-widest">Search</span></button>
                          <button onClick={() => { setActiveTab(activeTab === 'layouts' ? null : 'layouts'); }} className={`flex flex-col items-center gap-1 hover:text-[#1877F2] group ${activeTab === 'layouts' ? 'text-[#1877F2]' : ''}`}><LayoutGrid size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[7px] font-black uppercase tracking-widest">Layout</span></button>
                          <button onClick={() => { setActiveGalleryOverlay('size'); }} className={`flex flex-col items-center gap-1 hover:text-[#1877F2] group`}>
                            <Maximize2 size={20} className="group-hover:scale-110 transition-transform" /> 
                            <span className="text-[7px] font-black uppercase tracking-widest">Size</span>
                          </button>
                          <button onClick={() => { setActiveTab(activeTab === 'images' ? null : 'images'); }} className={`flex flex-col items-center gap-1 hover:text-[#1877F2] group ${activeTab === 'images' ? 'text-[#1877F2]' : ''}`}><ImageIcon size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[7px] font-black uppercase tracking-widest">Photos</span></button>
                          <button onClick={() => { setActiveTab(activeTab === 'text' ? null : 'text'); }} className={`flex flex-col items-center gap-1 hover:text-[#1877F2] group ${activeTab === 'text' ? 'text-[#1877F2]' : ''}`}><Type size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[7px] font-black uppercase tracking-widest">Text</span></button>
                          <button onClick={() => { setActiveTab(activeTab === 'theme' ? null : 'theme'); }} className={`flex flex-col items-center gap-1 hover:text-[#1877F2] group ${activeTab === 'theme' ? 'text-[#1877F2]' : ''}`}><Palette size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-[7px] font-black uppercase tracking-widest">Theme</span></button>
                        </aside>

                        {/* Sliding Panel Content */}
                        <div className={`transition-all duration-300 ease-out border-r border-slate-100 bg-white overflow-hidden ${activeTab ? 'w-[320px]' : 'w-0'}`}>
                          <div className="w-[320px] h-full flex flex-col">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{activeTab} Management</h4>
                              <button onClick={() => setActiveTab(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={14} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                              {activeTab === 'images' && (
                                <div className="grid grid-cols-2 gap-3">
                                  {galleryImages.map((img, i) => (
                                    <div key={i} className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-100 group relative cursor-pointer">
                                      <img src={resolveMedia(img, API_URL)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Plus size={20} className="text-white" />
                                      </div>
                                    </div>
                                  ))}
                                  <label className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-[#1877F2] hover:bg-blue-50 transition-all cursor-pointer group">
                                    <input type="file" className="hidden" multiple onChange={handleUpload} />
                                    <CloudUpload size={24} className="text-slate-300 group-hover:text-[#1877F2]" />
                                    <span className="text-[8px] font-black text-slate-400 group-hover:text-[#1877F2] uppercase tracking-widest">Add More</span>
                                  </label>
                                </div>
                              )}

                              {activeTab === 'layouts' && (
                                <div className="space-y-4">
                                  {[
                                    { name: 'Full Page', icon: <Square size={20} />, sub: '1 Photo' },
                                    { name: 'Grid View', icon: <LayoutGrid size={20} />, sub: '4 Photos' },
                                    { name: 'Landscape', icon: <Columns size={20} />, sub: ' Panoramic' },
                                    { name: 'Classic Story', icon: <Book size={20} />, sub: 'Mixed' }
                                  ].map((l, i) => (
                                    <button key={i} className="w-full p-4 rounded-xl border border-slate-100 hover:border-[#1877F2] hover:bg-blue-50 transition-all flex items-center gap-4 group text-left">
                                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#1877F2] transition-colors">{l.icon}</div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{l.name}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{l.sub}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {(!activeTab || (activeTab !== 'images' && activeTab !== 'layouts')) && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3 opacity-50 italic">
                                  <Sparkles size={32} />
                                  <p className="text-[9px] font-black uppercase tracking-widest">Content Loading...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <main className="flex-1 relative flex flex-col items-center justify-center p-6 bg-[#f0f1f3] overflow-hidden">
                          {/* Nav Arrows */}
                          <button
                            disabled={currentSpreadIndex === 0}
                            onClick={() => setCurrentSpreadIndex(prev => Math.max(0, prev - 1))}
                            className="absolute left-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all disabled:opacity-20 active:scale-95 z-[60]"
                          >
                            <ChevronLeft size={32} />
                          </button>
                          <button
                            disabled={currentSpreadIndex >= 5}
                            onClick={() => setCurrentSpreadIndex(prev => prev + 1)}
                            className="absolute right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all disabled:opacity-20 active:scale-95 z-[60]"
                          >
                            <ChevronRight size={32} />
                          </button>

                          {/* Photobook Visualization - Scaled for Elegance */}
                          <div className="w-full max-w-5xl aspect-[2/1] relative flex items-center justify-center animate-in zoom-in-95 duration-700">
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                              <span className={currentSpreadIndex === 0 ? 'text-[#1877F2]' : ''}>{currentSpreadIndex === 0 ? 'Back cover' : `Page ${currentSpreadIndex * 2 - 1}`}</span>
                              <div className="h-3 w-px bg-slate-300 shadow-sm" />
                              <span className={currentSpreadIndex === 0 ? 'text-[#1877F2]' : ''}>{currentSpreadIndex === 0 ? 'Front cover' : `Page ${currentSpreadIndex * 2}`}</span>
                            </div>

                            <div className="w-full h-full bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.15)] rounded-sm flex relative border border-slate-200/60 overflow-hidden group/spread hover:shadow-[0_60px_150px_-30px_rgba(0,0,0,0.2)] transition-all duration-700">
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/[0.03] via-black/[0.1] to-black/[0.03] z-10" />

                              {/* Left Side */}
                              <div className="flex-1 border-r border-slate-100/50 p-6 relative">
                                <div className="w-full h-full bg-white flex flex-col items-center justify-center group/page overflow-hidden">
                                  {currentSpreadIndex === 0 ? (
                                    <div className="w-full h-full flex flex-col items-center justify-between py-12 px-8 select-none">
                                      <div />
                                      <div className="group-hover/page:scale-105 transition-all duration-700">
                                        {globalSettings?.logo ? (
                                          <img src={resolveMedia(globalSettings.logo, API_URL)} className="h-8 mx-auto" alt="Logo" />
                                        ) : (
                                          <div className="text-xl font-black italic tracking-tighter">Amol <span className="text-[#1877F2]">Graphics</span></div>
                                        )}
                                      </div>
                                      <div className="text-center space-y-2">
                                        <div className="w-8 h-px bg-slate-100 mx-auto" />
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] max-w-[180px] leading-relaxed">
                                          {globalSettings?.contactAddress || globalSettings?.address || 'Premium Boutique Printing'}
                                        </p>
                                      </div>
                                    </div>
                                  ) : uploadedPhotos[currentSpreadIndex * 2] ? (
                                    <img src={resolveMedia(uploadedPhotos[currentSpreadIndex * 2].url, API_URL)} className="w-full h-full object-cover transition-transform duration-700 group-hover/page:scale-105" />
                                  ) : <ImageIcon size={32} className="text-slate-100" />}
                                </div>
                              </div>

                              {/* Right Side */}
                              <div className="flex-1 p-6 relative">
                                <div className="w-full h-full bg-slate-50/50 rounded-xs flex flex-col items-center justify-center group/page overflow-hidden border border-slate-50">
                                  {uploadedPhotos[currentSpreadIndex * 2 + 1] ? (
                                    <img src={resolveMedia(uploadedPhotos[currentSpreadIndex * 2 + 1].url, API_URL)} className="w-full h-full object-cover transition-transform duration-700 group-hover/page:scale-105" />
                                  ) : (
                                    <div className="w-full h-full relative group/design">
                                       {currentSpreadIndex === 0 && selectedDesign?.previewImage && (
                                         <img src={resolveMedia(selectedDesign.previewImage, API_URL)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/design:scale-105" alt="Design Preview" />
                                       )}
                                       <div className={`absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-4 ${currentSpreadIndex === 0 && selectedDesign?.previewImage ? 'bg-black/20 backdrop-blur-[2px]' : 'bg-white'}`}>
                                         {currentSpreadIndex === 0 && selectedDesign?.previewImage ? (
                                            <div className="space-y-1">
                                              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md block">Cover Design</span>
                                              <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest block">{selectedDesign.name}</span>
                                            </div>
                                         ) : (
                                            <>
                                              <ImageIcon size={32} className="text-slate-200 mx-auto opacity-30" />
                                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{currentSpreadIndex === 0 ? 'Choose Cover Photo' : 'Place Photo Here'}</span>
                                            </>
                                         )}
                                       </div>
                                     </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/page:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="text-white text-[8px] uppercase font-black tracking-widest bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30">Select Photo</button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                      if (e.target.files?.[0]) handlePhotoUpload(currentSpreadIndex * 2 + 1, e.target.files[0]);
                                    }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Compact Page Ribbon */}
                          <footer className="h-28 bg-white border-t border-slate-100 flex flex-col z-[100]">
                            <div className="h-8 border-b border-slate-50 flex items-center justify-between px-6">
                              <div className="flex items-center gap-6 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                <button className="flex items-center gap-1.5 hover:text-[#1877F2] transition-colors"><Grid size={12} /> View spread</button>
                                <button className="flex items-center gap-1.5 text-[#1877F2]"><LayoutGrid size={12} strokeWidth={3} /> All spreads</button>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-slate-900 border border-slate-100 px-3 py-0.5 rounded bg-slate-50 tracking-tighter">{currentSpreadIndex === 0 ? 'Cover' : `Pages ${currentSpreadIndex * 2 - 1}-${currentSpreadIndex * 2}`}</span>
                              </div>
                              <div className="flex items-center gap-4 text-slate-400">
                                <button className="hover:text-[#1877F2]" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut size={14} /></button>
                                <span className="text-[8px] font-black text-slate-900 w-8 text-center">{Math.round(zoom * 100)}%</span>
                                <button className="hover:text-[#1877F2]" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn size={14} /></button>
                              </div>
                            </div>

                            <div className="flex-1 overflow-x-auto flex items-center gap-4 px-6 no-scrollbar bg-slate-50/50">
                              {[0, 1, 2, 3, 4, 5].map(idx => (
                                <div key={idx} className="flex flex-col items-center">
                                  <button
                                    onClick={() => setCurrentSpreadIndex(idx)}
                                    className={`w-28 h-14 rounded transition-all overflow-hidden flex shadow-sm relative shrink-0 border-2
                                    ${currentSpreadIndex === idx ? 'border-[#1877F2] scale-105 shadow-md' : 'border-white hover:border-slate-200'}`}
                                  >
                                    <div className="flex-1 bg-slate-100 border-r border-white/50 overflow-hidden relative">
                                      {idx === 0 ? <div className="absolute inset-0 bg-slate-200 flex items-center justify-center"><Book size={12} className="text-slate-400 opacity-30" /></div> : uploadedPhotos[idx * 2] && <img src={resolveMedia(uploadedPhotos[idx * 2].url, API_URL)} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 bg-slate-100 overflow-hidden relative">
                                      {uploadedPhotos[idx * 2 + 1] && <img src={resolveMedia(uploadedPhotos[idx * 2 + 1].url, API_URL)} className="w-full h-full object-cover" />}
                                    </div>
                                  </button>
                                  <span className={`text-[7px] font-black uppercase tracking-widest mt-1.5 ${currentSpreadIndex === idx ? 'text-[#1877F2]' : 'text-slate-300'}`}>{idx === 0 ? 'Cover' : `${idx * 2 - 1}-${idx * 2}`}</span>
                                </div>
                              ))}

                              {/* Add Page Placeholder */}
                              <button className="flex flex-col items-center group shrink-0">
                                <div className="w-28 h-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-white group-hover:border-[#FF6B35] group-hover:bg-orange-50 transition-all">
                                  <Plus size={20} className="text-slate-200 group-hover:text-[#FF6B35]" />
                                </div>
                                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1.5 group-hover:text-[#FF6B35]">Add Page</span>
                              </button>
                            </div>
                          </footer>
                        </main>
                      </div>
                    </div>
                  )}
            </div>
          )}

                  <StudioReviews
                    globalSettings={globalSettings}
                    API_URL={API_URL}
                    resolveMedia={resolveMedia}
                  />

                  {categoryParam !== 'photo-album' && (
                    <StudioFaq
                      showAllFaqs={showAllFaqs}
                      setShowAllFaqs={setShowAllFaqs}
                      openFaq={openFaq}
                      setOpenFaq={setOpenFaq}
                    />
                  )}


                  {/* MAIN CATEGORY SECTION - For Non-Gallery Items */}
                  {!categoryParam.includes('gallery') && !categoryParam.includes('magnet') && categoryParam !== 'photo-album' && (
                    <div className="max-w-[1300px] mx-auto mb-20 px-4">
                      <div className="text-center mb-10">
                        <h2 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">
                          SINGLE {categoryParam.replace('-', ' ')}
                        </h2>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                          Simple. Elegant. Available in 6 classic shapes and multiple sizes.
                        </p>
                      </div>
                      <div className="relative mb-12">
                        <div id="shape-scroll-container-main" className="flex overflow-x-auto no-scrollbar gap-6 md:gap-8 py-8 px-4 scroll-smooth">
                          {dynamicShapes.map(s => (
                            <button key={s.id} onClick={() => pushQuery(s.id)} className="group flex flex-col items-center shrink-0 w-[180px] md:w-[210px]">
                              <div className="w-full aspect-[3/4] bg-white rounded-3xl overflow-hidden mb-5 shadow-2xl shadow-slate-200/50 transition-all relative border-[6px] border-white group-hover:border-[#1877F2] group-hover:scale-105">
                                {s.image ? (
                                  <img src={resolveMedia(s.image, API_URL)} className="w-full h-full object-cover transition-transform duration-700" alt={s.label} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50"><Shapes size={50} className="group-hover:text-[#1877F2] transition-colors" /></div>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-slate-900 capitalize tracking-tight group-hover:text-[#1877F2] transition-colors">{s.label}</h4>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. UPSELL SECTION: PHOTO GALLERY SET - Hidden on Gallery & Magnet Page */}
                  {!categoryParam.includes('gallery') && !categoryParam.includes('magnet') && categoryParam !== 'photo-album' && (
                    <div className="max-w-[1240px] mx-auto mb-6">
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="mb-6">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Photo Gallery Set</h2>
                          <p className="text-slate-500 font-medium text-base">Tell a story across your wall.</p>
                          <p className="text-blue-600 font-black text-base mt-0.5">Starting from just ₹199/- Each*</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 group cursor-pointer">
                              <img
                                src={`https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt="Gallery Item"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center">
                          <Link
                            href={`/studio-v2?category=photo-gallery-set`}
                            className="bg-[#28a745] hover:bg-[#218838] text-white font-black py-3 px-16 rounded-xl text-base transition-all shadow-xl shadow-green-500/20 active:scale-95 text-center"
                          >
                            EXPLORE NOW
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. SIDE-BY-SIDE PROMO CARDS: BIG WALLS & CUTOUTS */}
                  {categoryParam !== 'photo-album' && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1240px] mx-auto mb-6">
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                        <div className="text-center mb-4">
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Big Memories Deserve Big Walls</h2>
                          <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">PERFECT FOR SHOWPIECE WALLS</p>
                        </div>
                        <div className="w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden shadow-md mb-6">
                          <img
                            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200"
                            className="w-full h-full object-cover"
                            alt="Extra Large Acrylics"
                          />
                        </div>
                        <Link
                          href={`/studio-v2?category=extra-large-acrylics`}
                          className="bg-[#E3323A] hover:bg-[#c02a31] text-white font-black py-4 px-10 rounded-xl text-base transition-all shadow-lg active:scale-95 text-center"
                        >
                          Shop Extra Large Acrylics
                        </Link>
                      </div>

                      {/* Card 2: Photo Cutouts */}
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                        <div className="text-center mb-4">
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Acrylic Photo Cutouts</h2>
                          <p className="text-slate-400 font-medium text-xs uppercase tracking-widest leading-relaxed">SILHOUETTE CUTOUTS FOR YOUR WALL</p>
                        </div>
                        <div className="w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden shadow-md mb-6">
                          <img
                            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200"
                            className="w-full h-full object-cover"
                            alt="Acrylic Photo Cutouts"
                          />
                        </div>
                        <Link
                          href={`/studio-v2?category=acrylic-photo-cutouts`}
                          className="bg-[#FF6036] hover:bg-[#e8532f] text-white font-black py-4 px-16 rounded-xl text-base transition-all shadow-lg active:scale-95 text-center"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>

                    {/* 6. FEATURED SECTION: TRANSPARENT ACRYLIC WALL FRAMES */}
                    <div className="max-w-[1240px] mx-auto mb-6">
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="mb-6">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Transparent Acrylic Wall Frames</h2>
                          <p className="text-slate-500 font-medium text-base leading-relaxed max-w-2xl">
                            Clear as vision, strong as purpose — transparent acrylics let creativity shine without limits.
                          </p>
                          <p className="text-blue-600 font-black text-base mt-0.5">Starting from just ₹699/-</p>
                        </div>

                        <div className="w-full aspect-[21/9] bg-white rounded-3xl overflow-hidden shadow-xl mb-12 border border-slate-100 group">
                          <img
                            src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt="Transparent Acrylic Gallery"
                          />
                        </div>

                        <div className="flex justify-center flex-col items-center">
                          <Link
                            href={`/studio-v2?category=transparent-acrylic-frames`}
                            className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-black py-4 px-24 rounded-2xl text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-center"
                          >
                            EXPLORE NOW
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* 7. FEATURED SECTION: CREATIVE ACRYLIC WALL ART */}
                    <div className="max-w-[1240px] mx-auto mb-6">
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="mb-6">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Creative Acrylic Wall Art</h2>
                          <p className="text-slate-500 font-medium text-base leading-relaxed max-w-2xl">
                            Turn your walls into a masterpiece with our striking creative acrylic wall art.
                          </p>
                          <p className="text-blue-600 font-black text-base mt-0.5">Starting from just ₹1,198/-</p>
                        </div>

                        <div className="w-full aspect-[21/9] bg-white rounded-3xl overflow-hidden shadow-xl mb-12 border border-slate-100 group">
                          <img
                            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2000"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt="Creative Acrylic Art Gallery"
                          />
                        </div>

                        <div className="flex justify-center flex-col items-center">
                          <Link
                            href={`/studio-v2?category=creative-acrylic-wall-art`}
                            className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-black py-4 px-24 rounded-2xl text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-center"
                          >
                            EXPLORE NOW
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* 8. FEATURED SECTION: FRAMED ACRYLICS */}
                    <div className="max-w-[1240px] mx-auto mb-6">
                      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden text-center md:text-left">
                        <div className="mb-6 text-center">
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Framed Acrylics</h2>
                          <p className="text-slate-500 font-medium text-base">
                            All your memories framed in one beautiful glossy acrylic with custom framing option.
                          </p>
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4 mb-12">
                          {[
                            { color: '#E3323A', label: 'Red' },
                            { color: '#FFC107', label: 'Yellow' },
                            { color: '#000000', label: 'Black' },
                            { color: '#FFFFFF', label: 'White' },
                            { color: '#E3323A', label: 'Red' },
                            { color: '#FFC107', label: 'Yellow' },
                            { color: '#000000', label: 'Black' }
                          ].map((frame, i) => (
                            <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105" style={{ border: `6px solid ${frame.color}` }}>
                              <img
                                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"
                                className="w-full h-full object-cover"
                                alt={`Framed Acrylic ${frame.label}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center flex-col items-center">
                          <Link
                            href={`/studio-v2?category=framed-acrylics`}
                            className="bg-[#B666D2] hover:bg-[#a356bf] text-white font-black py-4 px-24 rounded-2xl text-lg transition-all shadow-xl shadow-purple-500/20 active:scale-95 text-center"
                          >
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                </main>
      </div>
          );
  }
          // VIEW 2: GALLERY FRAME COUNT SELECTION (Step 2 of 3)
          if (categoryParam.includes('gallery') && shapeParam && !frameCountParam) {
    return (
          <div className="bg-white min-h-screen flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={() => router.push(`/studio-v2?category=${categoryParam}`)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={24} />
              </button>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col items-center">
              <div className="w-full max-w-2xl mb-12">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Step 2 of 3</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-[66%] h-full bg-[#1877F2] rounded-full" />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-gray-100 rounded-full">
                  <Percent size={24} className="text-slate-900" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic">BUY MORE, SAVE MORE</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
                <div className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center ${tempFrameCount >= 2 && tempFrameCount < 5 ? 'border-[#1877F2] bg-blue-50/50 shadow-md' : 'border-gray-100 bg-white'}`}>
                  <span className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest leading-none">Buy Any 2+ Frames</span>
                  <span className="text-xl font-black text-slate-900 leading-none">@ 199/- Each</span>
                </div>
                <div className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center relative ${tempFrameCount >= 5 && tempFrameCount < 10 ? 'border-[#1877F2] bg-blue-50/50 shadow-md' : 'border-gray-100 bg-white'}`}>
                  <span className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest leading-none">Buy Any 5+ Frames</span>
                  <span className="text-xl font-black text-slate-900 leading-none">@ 179/- Each</span>
                </div>
                <div className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center ${tempFrameCount >= 10 ? 'border-[#1877F2] bg-blue-50/50 shadow-md' : 'border-gray-100 bg-white'}`}>
                  <span className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest leading-none">Buy Any 10+ Frames</span>
                  <span className="text-xl font-black text-slate-900 leading-none">@ 159/- Each</span>
                </div>
              </div>

              <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl p-8 mb-12 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50/30 -z-10" />
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Select Frames Count</h3>
                  <div className="bg-white border border-gray-200 px-4 py-1.5 rounded-lg shadow-sm">
                    <span className="text-lg font-black text-slate-900">{tempFrameCount}</span>
                  </div>
                </div>
                <div className="relative h-12 flex items-center mb-6">
                  <input
                    type="range" min="1" max="50" value={tempFrameCount}
                    onChange={(e) => setTempFrameCount(parseInt(e.target.value))}
                    className="w-full h-8 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1877F2]"
                    style={{ background: `linear-gradient(to right, #1877F2 ${((tempFrameCount - 1) / 49) * 100}%, #f3f4f6 0%)` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Frames Count</span>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{tempFrameCount} Frames</span>
                </div>
              </div>

              <button onClick={() => pushQuery(shapeParam, undefined, tempFrameCount)} className="w-full max-w-md h-14 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                Continue To Upload Images
              </button>
            </main>

            <style jsx>{`
          input[type='range']::-webkit-slider-thumb { appearance: none; width: 24px; height: 38px; background: white; border: 2px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); cursor: pointer; }
          input[type='range']::-moz-range-thumb { width: 24px; height: 38px; background: white; border: 2px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); cursor: pointer; }
        `}</style>
          </div>
          );
  }

          // VIEW 3: GALLERY PHOTO UPLOAD (Step 3 of 3)
          if (categoryParam.includes('gallery') && shapeParam && frameCountParam && !designIdParam) {
    return (
          <div className="bg-white min-h-screen flex flex-col">
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={() => router.push(`/studio-v2?category=${categoryParam}`)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={24} />
              </button>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col items-center">
              <div className="w-full max-w-2xl mb-12">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Step 3 of 3</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#1877F2] rounded-full" />
                </div>
              </div>

              <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-12 mb-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 text-[#2cb9b0]">
                  <CloudUpload size={96} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Upload Your Photos</h2>
                <p className="text-slate-400 font-medium text-xs md:text-sm mb-10 uppercase tracking-tight">Choose photos to create photo gallery set.</p>
                <label className="bg-[#48bdb2] hover:bg-[#3ca89f] text-white px-10 py-3.5 rounded-xl font-black text-base transition-all cursor-pointer active:scale-95">
                  <input type="file" className="hidden" multiple onChange={handleUpload} />
                  Select Photos
                </label>
              </div>

              <div className="mb-12">
                <span className="text-lg font-bold text-orange-400">{photoStats.uploaded} of {photoStats.required} uploaded</span>
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 w-full max-w-2xl mb-12">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative group">
                      <img src={resolveMedia(img, API_URL)} className="w-full h-full object-cover" />
                      <button onClick={() => setGalleryImages(gi => gi.filter(g => g !== img))} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  if (designs.length > 0) pushQuery(shapeParam, designs[0].id);
                  else pushQuery(shapeParam, 'custom-fallback');
                }}
                disabled={photoStats.uploaded < photoStats.required}
                className={`w-full max-w-md h-14 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95
                        ${photoStats.uploaded >= photoStats.required ? 'bg-[#1877F2] text-white shadow-blue-500/20 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                Continue To Editor
              </button>
            </main>
          </div>
          );
  }

  // VIEW 4: REGULAR DESIGN SELECTION
  if (shapeParam && !designIdParam && designs.length > 0) {
    const filteredDesigns = designs.filter(d => {
      if (designFilter === 'all') return true;
      return d.tags?.toLowerCase().includes('popular') || d.isPopular || (d.salesCount || 0) > 10;
    });

          return (
          <div className="bg-white min-h-screen">
            <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                <Link href={`/studio-v2?category=${categoryParam}`} className="hover:text-[#1877F2] transition-colors">{categoryParam.replace(/-/g, ' ')}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800">{selectedShape}</span>
              </div>

              {/* Filter Bar — Exact Image Parity */}
              <div className="bg-[#eef8ff] border border-blue-100 rounded-xl flex items-center shadow-sm mb-10 overflow-hidden h-[72px]">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm tracking-widest px-8 h-full uppercase">
                  <div className="w-5 h-5 flex flex-col gap-1 items-start justify-center">
                    <div className="w-5 h-[2.5px] bg-slate-800 rounded-full" />
                    <div className="w-3 h-[2.5px] bg-slate-800 rounded-full" />
                    <div className="w-5 h-[2.5px] bg-slate-800 rounded-full" />
                  </div>
                  FILTERS
                </div>
                <div className="flex flex-1 h-full p-2.5 gap-3">
                  <button
                    onClick={() => setDesignFilter('all')}
                    className={`flex items-center justify-center gap-3 px-10 rounded-lg font-black text-xs uppercase tracking-widest transition-all h-full ${designFilter === 'all'
                      ? 'bg-[#008dff] text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-slate-400 hover:bg-white/80'
                      }`}
                  >
                    <ImageIcon size={20} strokeWidth={2.5} />
                    All
                  </button>
                  <button
                    onClick={() => setDesignFilter('popular')}
                    className={`flex items-center justify-center gap-3 px-10 rounded-lg font-black text-xs uppercase tracking-widest transition-all h-full border border-slate-100 ${designFilter === 'popular'
                      ? 'bg-[#008dff] text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-slate-400 hover:bg-white/80'
                      }`}
                  >
                    <div className={`${designFilter === 'popular' ? 'text-white' : 'text-slate-300'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                      </svg>
                    </div>
                    Popular
                  </button>
                </div>
              </div>

              {/* Design Cards — Immersion & Parity */}
              {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDesigns.map((d, idx) => (
                    <div
                      key={d.id}
                      onClick={() => pushQuery(selectedShape, d.id)}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col"
                    >
                      {/* Image Area — Gray Wall background */}
                      <div className="relative w-full aspect-[1/1] bg-[#bdc5d1] overflow-hidden flex items-center justify-center">
                        {/* Lifestyle background wallpaper texture/color */}
                        <div className="absolute inset-0 bg-[#bdc5d1]" />

                        {/* Flower decor in bottom-left — Exact Position/Style */}
                        <div className="absolute bottom-[-10px] left-[-10px] w-1/2 aspect-square z-10 pointer-events-none group-hover:scale-105 transition-transform duration-1000 origin-bottom-left">
                          <img
                            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400"
                            className="w-full h-full object-contain drop-shadow-2xl"
                            alt="Decor"
                          />
                        </div>

                        {/* Centered Product Frame */}
                        <div
                          className="relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_45px_100px_rgba(0,0,0,0.4)] transition-all duration-700 bg-white z-20"
                          style={{
                            width: selectedShape.toLowerCase().includes('land') ? '82%' : selectedShape.toLowerCase().includes('port') ? '52%' : '65%',
                            aspectRatio: selectedShape.toLowerCase().includes('land') ? '3/2' : selectedShape.toLowerCase().includes('port') ? '2/3' : '1/1',
                            borderRadius: selectedShape.toLowerCase().includes('circle') ? '50%' : '2px',
                            clipPath: selectedShape.toLowerCase().includes('hex') ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 'none',
                          }}
                        >
                          {/* Glossy Reflection — Line across top-left */}
                          <div className="absolute inset-0 z-30 pointer-events-none">
                            <div className="absolute top-[10%] left-[10%] w-[150%] h-[20px] bg-white/20 rotate-[-45deg] blur-[2px]" />
                            <div className="absolute top-[15%] left-[5%] w-[150%] h-[5px] bg-white/10 rotate-[-45deg] blur-[1px]" />
                          </div>

                          {d.previewImage ? (
                            <img
                              src={resolveMedia(d.previewImage, API_URL)}
                              className="w-full h-full object-fill"
                              alt={d.name}
                            />
                          ) : (
                            <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4">
                              <span className="text-xl font-black text-slate-800 opacity-60 text-center uppercase leading-none">Upload<br />Your Photo</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 flex items-center justify-end bg-white border-t border-slate-50">
                        <span className="text-[13px] font-black text-[#008dff] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                          START DESIGN <ChevronRight size={18} strokeWidth={3} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
          );
  }

          const isGallerySet = categoryParam.includes('gallery') && shapeParam && designIdParam;

          if (isGallerySet && singleEditIndex === null) {
    const totalFrames = parseInt(frameCountParam || "1");
          const totalPrice = (displayPrice * totalFrames).toFixed(0);
          const originalPrice = (299 * totalFrames).toFixed(0);
          const savings = (parseInt(originalPrice) - parseInt(totalPrice)).toString();

          const isLandscape = (selectedShape || "").toLowerCase().includes('land');
          const rawW = selectedSize?.width || 0;
          const rawH = selectedSize?.height || 0;
          const sizeW = isLandscape ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
          const sizeH = isLandscape ? Math.min(rawW, rawH) : Math.max(rawW, rawH);

          return (
          <div className="bg-[#f2f2f2] min-h-screen flex flex-col overflow-hidden font-sans">
            {/* Global SVG Clip Definitions — Essential at root for immediate browser mask application */}
            <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
              <defs>
                <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
                  <path d="M0.5,1 C0.5,1 0,0.7 0,0.35 C0,0.1 0.2,0 0.5,0.2 C0.8,0 1,0.1 1,0.35 C1,.7 .5,1 .5,1 Z" />
                </clipPath>
                <clipPath id="hexagon-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.25 0 L 0.75 0 L 1 0.5 L 0.75 1 L 0.25 1 L 0 0.5 Z" />
                </clipPath>
                <clipPath id="circle-clip" clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.5" />
                </clipPath>
              </defs>
            </svg>
            {/* Top Navbar */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm z-[100]">
              <div className="flex items-center gap-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#1877F2] font-black text-xs uppercase tracking-widest hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
                  <ChevronLeft size={18} /> Back
                </button>
                <div className="h-4 w-px bg-slate-200 hidden md:block" />
                <nav className="hidden md:flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <Link href="/contact" className="hover:text-[#1877F2]">Contact Us</Link>
                  <Link href="/faqs" className="hover:text-[#1877F2]">FAQ's</Link>
                  <Link href="/track-order" className="hover:text-[#1877F2]">Track Order</Link>
                </nav>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                <Link href="/">
                  <img src="/logo.png" className="h-8 md:h-10 object-contain" alt="Amol Graphics" />
                </Link>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 hidden lg:block tracking-widest">Login / Register</span>
                <Link href="/cart" className="relative transition-transform active:scale-90 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 hover:bg-white">
                  <ShoppingCart className="text-slate-700" size={20} />
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
                </Link>
              </div>
            </header>

            {/* Quality Banner */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 border-b border-gray-100 shadow-sm z-50">
              <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-8 whitespace-nowrap text-slate-900 font-bold uppercase text-[9px] tracking-widest">
                <span>Trusted Since 2015</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>1 Crore+ Photos Printed</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>Quality Printing</span>
              </div>
            </div>

            {/* Gallery Title/Category */}
            <div className="text-center pt-8 pb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                Acrylic Photo Print
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 space-x-2">
                <span>● Professional Grade</span>
                <span>● Ultra-Smooth Finish</span>
                <span>● Life-long Gloss</span>
              </p>
            </div>

            {/* Selected Config Bar */}
            <div className="flex justify-center py-4 gap-2 z-40">
              <span className="text-[10px] font-black text-slate-400 uppercase pt-2 mr-2">SELECTED :</span>
              <span className="bg-[#d6ebfa] text-[#1877F2] text-[11px] font-black px-4 py-2 rounded-xl uppercase">{selectedSize?.label || '6x6"'}</span>
              <span className="bg-[#d6ebfa] text-[#1877F2] text-[11px] font-black px-4 py-2 rounded-xl uppercase">{selectedShape}</span>
              <span className="bg-[#d6ebfa] text-[#1877F2] text-[11px] font-black px-4 py-2 rounded-xl uppercase">{borderColor === 'none' ? 'No Border' : 'Border Active'}</span>
            </div>
            {/* Main Frames List */}
            <main className="flex-1 overflow-x-auto no-scrollbar scroll-smooth pb-64">
              <div className="flex gap-8 px-8 min-w-max h-full items-start pt-8">
                {[...Array(totalFrames)].map((_, i) => {
                  const photo = uploadedPhotos[i];
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-[260px] md:w-[300px] bg-[#F3F4F6] rounded-[32px] shadow-[0_15px_45px_rgba(0,0,0,0.06)] p-8 flex flex-col relative transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)]"
                      >
                        {/* Dimension markers */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center justify-between w-[65%] text-slate-800 font-bold text-[13px]">
                          <ChevronLeft size={16} />
                          <span className="whitespace-nowrap uppercase tracking-widest">{selectedSize?.label.split('x')[0] || '6'} INCH</span>
                          <ChevronRight size={16} />
                        </div>

                        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center justify-between h-[50%] text-slate-800 font-bold text-[13px]">
                          <ChevronUp size={16} />
                          <span className="rotate-90 whitespace-nowrap uppercase tracking-widest">{selectedSize?.label.split('x')[1] || '6'} INCH</span>
                          <ChevronDown size={16} />
                        </div>

                        {/* Trash Button */}
                        <button
                          onClick={() => {
                            const newPhotos = { ...uploadedPhotos };
                            delete newPhotos[i];
                            setUploadedPhotos(newPhotos);
                            if (totalFrames > 1) pushQuery(selectedShape, designIdParam, totalFrames - 1);
                          }}
                          className="absolute top-6 right-6 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all z-20 border border-slate-100"
                        >
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>

                        {/* Main Shape Container */}
                        <div className="relative mt-8 aspect-square flex items-center justify-center" style={{
                          backgroundColor: borderColor && borderColor !== 'none' ? borderColor : 'transparent',
                          borderRadius: selectedShape.toLowerCase().includes('block') || selectedShape.toLowerCase().includes('square') ? '12px' : (selectedShape.toLowerCase().includes('circle') ? '50%' : '0'),
                          clipPath: selectedShape.toLowerCase().includes('heart') ? 'url(#heart-clip)' : (selectedShape.toLowerCase().includes('hex') ? 'url(#hexagon-clip)' : (selectedShape.toLowerCase().includes('circle') ? 'url(#circle-clip)' : 'none')),
                          filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.15))'
                        }}>
                          <div className="w-[94%] h-[94%] bg-white relative overflow-hidden" style={{
                            borderRadius: (selectedShape.toLowerCase().includes('heart') || selectedShape.toLowerCase().includes('hex') || selectedShape.toLowerCase().includes('circle')) ? '0' : '8px',
                            clipPath: selectedShape.toLowerCase().includes('heart') ? 'url(#heart-clip)' : (selectedShape.toLowerCase().includes('hex') ? 'url(#hexagon-clip)' : (selectedShape.toLowerCase().includes('circle') ? 'url(#circle-clip)' : 'none')),
                          }}>
                            {photo ? (
                              <div className="w-full h-full relative group">
                                <DesignCanvas
                                  design={selectedDesign}
                                  shape={selectedShape}
                                  photos={{ 0: photo }}
                                  onAdjust={(idx: number, state: any) => {
                                    setUploadedPhotos(prev => ({ ...prev, [i]: { ...state } }));
                                  }}
                                  isFinal={false}
                                  apiUrl={API_URL}
                                />
                                <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                                    <Move size={12} className="text-white" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Drag to Adjust</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full bg-white flex flex-col items-center justify-center text-slate-200">
                                <ImageIcon size={48} strokeWidth={1} className="opacity-10" />
                              </div>
                            )}
                          </div>
                          {!photo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <label className="bg-[#1877F2] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(i, e.target.files[0])} />
                                <Plus size={28} strokeWidth={3} />
                              </label>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 text-center pb-4">
                          <span className={`text-[11px] font-black uppercase tracking-wider`} style={{ color: borderColor === 'none' ? '#cbd5e1' : borderColor }}>
                            {borderColor === 'none' ? 'No Border Selected' : (borderColor === '#E1306C' ? 'Pink Printed Border' : 'Custom Printed Border')}
                          </span>
                        </div>

                        {/* Compact Zoom Slider - Moved clearer below frame */}
                        {photo && (
                          <div className="flex flex-col items-center mb-4">
                            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 shadow-sm rounded-full px-4 py-1.5 flex items-center gap-3 w-[180px]">
                              <button
                                onClick={() => setUploadedPhotos(prev => ({ ...prev, [i]: { ...prev[i], scale: Math.max(0.5, (prev[i]?.scale || 1) - 0.1) } }))}
                                className="text-slate-300 hover:text-blue-500"
                              >
                                <MinusCircle size={14} />
                              </button>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.01"
                                value={photo.scale || 1}
                                onChange={(e) => setUploadedPhotos(prev => ({ ...prev, [i]: { ...prev[i], scale: parseFloat(e.target.value) } }))}
                                className="flex-1 accent-[#1877F2] h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                              />
                              <button
                                onClick={() => setUploadedPhotos(prev => ({ ...prev, [i]: { ...prev[i], scale: Math.min(2, (prev[i]?.scale || 1) + 0.1) } }))}
                                className="text-slate-300 hover:text-blue-500"
                              >
                                <PlusCircle size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex gap-4 w-full pt-4">
                          <button
                            onClick={() => pushQuery(selectedShape, designIdParam, totalFrames, i)}
                            className="flex-1 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-900 font-extrabold text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all group"
                          >
                            <LucideEdit size={18} className="text-[#1877F2] group-hover:scale-110 transition-transform" /> Edit
                          </button>
                          <button
                            onClick={() => handleCopyFrame(i)}
                            className="flex-1 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-900 font-extrabold text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all group"
                          >
                            <Copy size={18} className="text-[#1877F2] group-hover:scale-110 transition-transform" /> Copy
                          </button>
                        </div>
                      </div>
                      <span className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-50">Frame {i + 1} of {totalFrames}</span>
                    </div>
                  );
                })}
              </div>
            </main>

            {/* Floating Action Dash - High Fidelity PrintShoppy Style */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] w-[95%] max-w-5xl px-4">
              <div className="bg-white rounded-[45px] shadow-[0_50px_120px_rgba(0,0,0,0.3)] overflow-hidden border border-white/50 backdrop-blur-3xl p-8">
                {/* Top Row: Info & Pricing */}
                <div className="flex items-center justify-between mb-8 px-4">
                  {/* Left: Frames Count */}
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <h5 className="text-[18px] font-black text-slate-800 leading-[1] tracking-tighter uppercase whitespace-nowrap">Frames<br />Count</h5>
                    </div>
                    <span className="text-8xl font-black text-[#1caf9c] leading-none tracking-[-0.08em]">{totalFrames}</span>
                    <div className="flex flex-col gap-2">
                      <span className="bg-[#f0faf8] text-[#1caf9c] text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest border border-[#d1f2eb]">Each ₹{Math.round(Number(totalPrice) / Number(totalFrames))}</span>
                    </div>
                  </div>

                  {/* Middle: Add More Photos */}
                  <div className="flex-1 max-w-md px-12">
                    <label className="w-full h-16 bg-[#f4f7f9] hover:bg-[#e9eff3] text-slate-700 font-extrabold text-xs uppercase tracking-widest flex items-center gap-4 px-3 transition-all rounded-full cursor-pointer shadow-sm border border-slate-100/50 group">
                      <input type="file" className="hidden" multiple onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setIsUploading(true);
                        let currentCount = totalFrames;
                        for (const file of files) {
                          const formData = new FormData();
                          formData.append("image", file);
                          try {
                            const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
                            const data = await res.json();
                            setUploadedPhotos(prev => ({ ...prev, [currentCount]: { url: data.url, x: 0, y: 0, scale: 0.8, rotate: 0 } }));
                            currentCount++;
                          } catch (err) { console.error(err); }
                        }
                        setIsUploading(false);
                        pushQuery(selectedShape, designIdParam, currentCount);
                      }} />
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Plus size={18} strokeWidth={4} className="text-[#1877F2]" />
                      </div>
                      <span className="whitespace-nowrap">Add More Photos</span>
                    </label>
                  </div>

                  {/* Right: Pricing */}
                  <div className="flex flex-col items-end">
                    <span className="text-lg text-slate-300 font-black line-through leading-none opacity-60 italic tracking-tighter">₹{originalPrice}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black text-[#1877F2] tracking-tighter leading-none mb-1">₹{totalPrice}</span>
                    </div>
                    <span className="bg-[#1caf9c] text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-teal-500/20">₹{savings} SAVE</span>
                  </div>
                </div>

                {/* Bottom Row: Controls & Add to Cart */}
                <div className="flex gap-6 items-center">
                  <div className="flex gap-4 items-stretch h-28">
                    <button onClick={() => setActiveGalleryOverlay('size')} className="w-24 bg-white rounded-[40px] flex flex-col items-center justify-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group">
                      <Maximize2 size={22} className="text-[#1877F2]" strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase text-[#1877F2] tracking-widest">Size</span>
                    </button>
                    <button onClick={() => setActiveGalleryOverlay('shape')} className="w-24 bg-white rounded-[40px] flex flex-col items-center justify-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group">
                      <LayoutGrid size={22} className="text-[#1877F2]" strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase text-[#1877F2] tracking-widest">Shape</span>
                    </button>
                    <button onClick={() => setActiveGalleryOverlay('border')} className="w-24 bg-white rounded-[40px] flex flex-col items-center justify-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group">
                      <PenTool size={22} className="text-[#1877F2]" strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase text-[#1877F2] tracking-widest">Border</span>
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isCapturing}
                    className="flex-1 bg-[#1877F2] h-28 rounded-[40px] flex items-center justify-center gap-6 text-white font-black uppercase text-3xl shadow-[0_20px_60px_rgba(24,119,242,0.4)] hover:shadow-[0_25px_80px_rgba(24,119,242,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                    {isCapturing ? <Loader2 size={36} className="animate-spin" /> : <>Add to Cart <ArrowRight size={36} strokeWidth={4} className="group-hover:translate-x-2 transition-transform" /></>}
                  </button>
                </div>
              </div>
            </div>

            {/* Global Overlays */}
            {activeGalleryOverlay && (
              <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-end justify-center sm:items-center p-4">
                <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 relative">
                  <button onClick={() => setActiveGalleryOverlay(null)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900"><X size={28} /></button>
                  <h4 className="text-2xl font-black uppercase tracking-tight mb-8 text-slate-800">SELECT {activeGalleryOverlay}</h4>

                  <div className={`${activeGalleryOverlay === 'shape' ? 'grid grid-cols-4' : (activeGalleryOverlay === 'border' ? 'flex items-center justify-between px-2 pb-6 pt-2' : 'grid grid-cols-2')} gap-4 max-h-[50vh] overflow-y-auto no-scrollbar pb-4`}>
                    {activeGalleryOverlay === 'size' && sizeOptions.map((opt: any) => (
                      <button key={opt.id} onClick={() => { setSelectedSize(opt); setActiveGalleryOverlay(null); }} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${selectedSize?.label === opt.label ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-600'}`}>
                        <span className="text-lg font-black">{opt.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">₹{opt.price}/-</span>
                      </button>
                    ))}
                    {activeGalleryOverlay === 'shape' && (dynamicShapes.length > 0 ? dynamicShapes : [
                      { id: 'Square', label: 'SQUARE' },
                      { id: 'Hexagone', label: 'HEXAGONE' },
                      { id: 'Circle', label: 'CIRCLE' },
                      { id: 'Heart', label: 'HEART' },
                    ]).map((shape: any) => (
                      <button key={shape.id} onClick={() => { pushQuery(shape.id, designIdParam, totalFrames); setActiveGalleryOverlay(null); }} className={`p-4 rounded-3xl transition-all flex flex-col items-center gap-3 group`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2
                        ${selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'border-blue-500 bg-blue-50 shadow-[0_10px_25px_rgba(59,130,246,0.15)]' : 'border-gray-100 bg-white hover:border-blue-200'}
                        shadow-[0_8px_16px_rgba(0,0,0,0.04)]`}>
                          {shape.id.toLowerCase().includes('sq') && <Square size={26} className={selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'text-blue-500' : 'text-gray-400'} strokeWidth={1.5} />}
                          {shape.id.toLowerCase().includes('hex') && <Hexagon size={26} className={selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'text-blue-500' : 'text-gray-400'} strokeWidth={1.5} />}
                          {shape.id.toLowerCase().includes('circ') && <Circle size={26} className={selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'text-blue-500' : 'text-gray-400'} strokeWidth={1.5} />}
                          {shape.id.toLowerCase().includes('heart') && <Heart size={26} className={selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'text-blue-500' : 'text-gray-400'} strokeWidth={1.5} />}
                          {!['sq', 'circ', 'heart', 'hex'].some(s => shape.id.toLowerCase().includes(s)) && <Shapes size={26} className="text-gray-400" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedShape.toLowerCase().includes(shape.id.toLowerCase()) ? 'text-blue-500' : 'text-gray-400'}`}>{shape.label}</span>
                      </button>
                    ))}
                    {activeGalleryOverlay === 'border' && [
                      { id: 'none', label: 'None', color: '#888888' },
                      { id: 'black', label: 'Black', color: '#000000' },
                      { id: 'blue', label: 'Blue', color: '#1877F2' },
                      { id: 'green', label: 'Green', color: '#1caf9c' },
                      { id: 'pink', label: 'Pink', color: '#E1306C' },
                      { id: 'red', label: 'Red', color: '#ef4444' },
                    ].map((b: any) => (
                      <button key={b.id} onClick={() => { setBorderColor(b.id === 'none' ? 'none' : b.color); setActiveGalleryOverlay(null); }} className="flex flex-col items-center gap-2 group">
                        <div className={`w-10 h-6 rounded-full transition-all duration-300 ${borderColor === b.color || (b.id === 'none' && borderColor === 'none') ? 'ring-4 ring-blue-400/50 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'hover:scale-105 opacity-80 hover:opacity-100'}`} style={{ backgroundColor: b.color }} />
                        <span className={`text-[10px] font-bold transition-colors ${borderColor === b.color || (b.id === 'none' && borderColor === 'none') ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`}>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          );
  }

          // VIEW 4.1: SINGLE PRODUCT MAIN EDITOR (e.g. Acrylic Photo Frames)
          // Unified view for both Portrait and Landscape custom designs
          const isCustomProduct = (designIdParam || (categoryParam && !categoryParam.includes('gallery'))) && !categoryParam.includes('gallery');

          if (isCustomProduct && singleEditIndex === null) {
    const totalPrice = displayPrice || activeProductData?.price || 0;
          const originalPrice = (totalPrice * 1.5).toFixed(0);
    const hasPhoto = Object.keys(uploadedPhotos).length > 0;

          // Ensure we have a design object
          const design = selectedDesign || designs[0] || {name: activeProductData?.name || 'Custom Product', id: 'custom', photoCount: 1 };

          const isLandscape = (selectedShape || "").toLowerCase().includes('land');
          const rawW = selectedSize?.width || 0;
          const rawH = selectedSize?.height || 0;

          const sizeW = isLandscape ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
          const sizeH = isLandscape ? Math.min(rawW, rawH) : Math.max(rawW, rawH);

          const cmW = (sizeW * 2.54).toFixed(1);
          const cmH = (sizeH * 2.54).toFixed(1);
          // Calculate dynamic visual width based on physical size (Responsive & Proportional)
          const baseVisualWidth = 320; // Increased starting point
          const growthFactor = (sizeW - 6) * 15; // Increased growth factor
          const finalVisualWidth = Math.min(650, baseVisualWidth + growthFactor); // Increased max width to 650px

          return (
          <div className="bg-white h-screen flex flex-col font-sans overflow-hidden">
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#1877F2] font-black text-xs uppercase tracking-widest hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
                  <ChevronLeft size={18} /> Back
                </button>
                <div className="h-4 w-px bg-slate-200 hidden md:block" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Trusted Since 2015 | Professional Grade Printing</span>
              </div>
              <img src="/logo.png" className="h-8 md:h-10" alt="Amol Graphics" />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShoppingCart size={22} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Cart</span>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-hidden">
              {/* Two-pane layout — fills remaining screen height exactly */}
              <div className="flex flex-col lg:flex-row h-full">
                {/* LEFT: INTERACTIVE CANVAS WITH DIMENSION LABELS */}
                <div className="flex-1 relative flex items-center justify-center p-8 md:p-12 lg:p-16 bg-[#f8f9fa] border-r border-slate-100 min-h-0">
                  <div className="relative group">
                    {/* BREADCRUMB INDICATOR */}
                    <div className="absolute -top-16 left-0 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => router.push(`/studio-v2?category=${categoryParam}`)}>{categoryParam.replace('-', ' ')}</span>
                      <ChevronRight size={12} strokeWidth={3} />
                      <span className="text-slate-900">{selectedShape || 'Portrait'}</span>
                      <ChevronRight size={12} strokeWidth={3} />
                      <span className="text-blue-500">Customize</span>
                    </div>

                    {/* TOP DIMENSION LABEL */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <span className="text-[13px] font-bold text-slate-900 tracking-tight">{sizeW} inch ({cmW} cm)</span>
                    </div>

                    {/* SIDE DIMENSION LABEL */}
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-700">
                      <span className="text-[13px] font-bold text-slate-900 tracking-tight">{sizeH} inch ({cmH} cm)</span>
                    </div>

                    {/* MAIN CANVAS BOX — EDGE TO EDGE (No border padding) */}
                    <div className="relative bg-[#f0f0f0] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[2px] border border-slate-300 overflow-hidden">
                      <div
                        className="relative overflow-hidden bg-slate-100 cursor-move select-none"
                        style={{
                          width: `${finalVisualWidth}px`,
                          aspectRatio: sizeW && sizeH ? `${sizeW}/${sizeH}` : '1/1.3'
                        }}
                      >
                        <DesignCanvas
                          design={selectedDesign}
                          shape={selectedShape}
                          photos={uploadedPhotos}
                          isFinal={false}
                          apiUrl={API_URL}
                          onUpload={handlePhotoUpload}
                          onAdjust={(idx: number, photo: any) => {
                            setUploadedPhotos(prev => ({ ...prev, [idx]: photo }));
                          }}
                          selectedSize={selectedSize}
                          productCategory={categoryParam}
                        />
                        {/* Drag hint — shown when photo exists */}
                        {uploadedPhotos[0] && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 pointer-events-none backdrop-blur-sm">
                            <Move size={11} /> Drag to adjust
                          </div>
                        )}
                      </div>

                    </div>

                    {/* SHADOW BASE */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-black/10 blur-[50px] rounded-[100%] -z-10" />

                    {/* RELOCATED CONTROLS TOOLBAR (Outside Frame) */}
                    <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full max-w-[340px]">
                      {/* Zoom Controls */}
                      {hasPhoto && (
                        <div className="w-full flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all">
                          <button onClick={() => {
                            const s = (uploadedPhotos[0]?.scale || 1) - 0.1;
                            if (s >= 0.5) setUploadedPhotos(prev => ({ ...prev, [0]: { ...prev[0], scale: s } }));
                          }} className="text-slate-300 hover:text-blue-500 transition-colors"><ZoomOut size={20} /></button>

                          <div className="flex-1 px-4">
                            <input
                              type="range" min="0.5" max="3" step="0.01"
                              value={uploadedPhotos[0]?.scale || 1}
                              onChange={(e) => setUploadedPhotos(prev => ({ ...prev, [0]: { ...prev[0], scale: parseFloat(e.target.value) } }))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>

                          <button onClick={() => {
                            const s = (uploadedPhotos[0]?.scale || 1) + 0.1;
                            if (s <= 3) setUploadedPhotos(prev => ({ ...prev, [0]: { ...prev[0], scale: s } }));
                          }} className="text-slate-300 hover:text-blue-500 transition-colors"><ZoomIn size={20} /></button>
                        </div>
                      )}

                      {/* Change Photo Button */}
                      <label className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 cursor-pointer hover:bg-black active:scale-95 transition-all shadow-xl whitespace-nowrap">
                        <CloudUpload size={18} className="text-blue-400" /> Change Photo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(e);
                        }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* RIGHT: CONFIGURATION & INFO SIDEBAR — scrolls internally */}
                <div className="flex-1 bg-white px-8 py-6 md:px-10 md:py-8 overflow-y-auto">
                  <div className="space-y-6 max-w-xl">
                    <header className="space-y-4">
                      <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] italic">{(activeProductData?.name || design?.name || 'Custom Product').toUpperCase()}</h1>
                      <div className="flex items-center gap-6 mt-8">
                        {parseInt(originalPrice) > totalPrice && (
                          <span className="text-2xl font-bold text-slate-300 line-through">₹{originalPrice}</span>
                        )}
                        <span className="text-6xl font-black text-[#1caf9c] tracking-tighter">₹{totalPrice}</span>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full w-fit">Free Shipping</span>
                          <span className="text-[10px] font-bold text-orange-400 mt-1 uppercase tracking-tight">★ Trusted Quality</span>
                        </div>
                      </div>
                    </header>

                    {/* SIZE SELECTION MATRIX */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Size (Inches)</span>
                          <div className="h-4 w-px bg-slate-200" />
                          <span className="text-[12px] font-bold text-blue-500 uppercase">Available Units</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select One</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {sizeOptions.map(size => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`h-14 flex items-center justify-center rounded-xl border-2 font-black text-[13px] transition-all relative
                                    ${selectedSize?.id === size.id ? 'border-blue-600 bg-blue-50/20 text-blue-600 shadow-lg shadow-blue-500/5' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50 bg-white'}`}
                          >
                            {size.label}
                            {selectedSize?.id === size.id && <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"><Check size={12} strokeWidth={4} /></div>}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* SPEC SUMMARY PANEL */}
                    <section className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-4">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Construction Specs</p>
                      <div className="space-y-3">
                        <p className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">Selected Size : <span className="text-slate-900 font-black">{selectedSize?.label} Inches</span></p>
                        <p className="text-[14px] font-bold text-slate-600 uppercase tracking-tight">Thickness : <span className="text-slate-900 font-black">{selectedSize?.thickness || "3 MM"}</span></p>
                        <p className="text-[14px] font-bold text-slate-600 uppercase tracking-tight leading-relaxed">Mounting : <span className="text-slate-900 font-black">{selectedSize?.mounting || "Adhesive Tape (Included)"}</span></p>
                      </div>
                    </section>

                    {/* UPLOAD & QUANTITY SECTION */}
                    <section className="pt-8 border-t border-slate-50 space-y-8">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">1. Upload Original Photos</h3>
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Required *</span>
                        </div>

                        {!hasPhoto ? (
                          <label className="block bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-blue-500 transition-all hover:bg-blue-50/30 group">
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><CloudUpload size={28} /></div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">TAP HERE TO SELECT FILES</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max size 20MB per photo</p>
                          </label>
                        ) : (
                          <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 p-4 rounded-2xl animate-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                <img src={resolveMedia(Object.values(uploadedPhotos)[0].url, API_URL)} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase">1 IMAGE ADDED</p>
                                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">READY TO PRINT</p>
                              </div>
                            </div>
                            <button onClick={() => setUploadedPhotos({})} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic">Note: High resolution images provide better print result.</p>
                      </div>

                      {/* FREE GIFT + ADD TO CART */}
                      <section className="space-y-3 pt-2">
                        <div className="bg-[#fff8ee] border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                          <span className="text-xl">🎁</span>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase">FREE GIFT <span className="text-orange-500">WORTH ₹299</span></p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Limited time offer!</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAddToCart()}
                            disabled={!hasPhoto || isCapturing}
                            className={`flex-1 h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
                                  ${hasPhoto ? 'bg-[#ef4444] text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-dashed border-slate-200'}`}
                          >
                            {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                            Add to Cart
                          </button>
                        </div>
                        <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ships Fast · Safe Packaging · Quality Assured</p>
                      </section>
                    </section>

                  </div>
                </div>

              </div>
            </main>
          </div>
          );
  }

          // VIEW 5: SINGLE FRAME EDITOR MODAL
          if (singleEditIndex !== null && workingPhoto) {
    const totalFrames = frameCountParam ? parseInt(frameCountParam) : 1;
          const isPhotoGallery = categoryParam.includes('gallery');

    const handleApply = (shouldClose = true, nextIdx?: number) => {
      if (!workingPhoto || !workingPhoto.url) return;
      setUploadedPhotos(prev => ({...prev, [singleEditIndex]: {...workingPhoto} }));
          if (shouldClose) {
        if (nextIdx !== undefined) pushQuery(selectedShape, designIdParam, totalFrames, nextIdx);
          else pushQuery(selectedShape, designIdParam, totalFrames);
      }
    };

    const handleClose = () => {
      const original = uploadedPhotos[singleEditIndex];
          const hasChanges = !original ||
          original.url !== workingPhoto.url ||
          original.scale !== workingPhoto.scale ||
          original.x !== workingPhoto.x ||
          original.y !== workingPhoto.y ||
          original.rotate !== workingPhoto.rotate;

          if (hasChanges) setShowUnsavedPrompt(true);
          else pushQuery(selectedShape, designIdParam, totalFrames);
    };

          return (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <header className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Editing : {singleEditIndex + 1}/{totalFrames}</span>
                    <div className="flex gap-1">
                      <button
                        disabled={singleEditIndex === 0}
                        onClick={() => handleApply(true, singleEditIndex - 1)}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        disabled={singleEditIndex === totalFrames - 1}
                        onClick={() => handleApply(true, singleEditIndex + 1)}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[...Array(totalFrames)].map((_, i) => (
                      <button key={i} onClick={() => handleApply(true, i)} className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${singleEditIndex === i ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        style={{
                          clipPath: selectedShape.toLowerCase().includes('heart') ? 'url(#heart-clip)' : (selectedShape.toLowerCase().includes('hex') ? 'url(#hexagon-clip)' : (selectedShape.toLowerCase().includes('circle') ? 'url(#circle-clip)' : 'none'))
                        }}
                      >
                        <img src={resolveMedia(uploadedPhotos[i]?.url, API_URL)} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="bg-[#e7f5f9] hover:bg-[#d6eff6] text-[#1caf9c] px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer transition-colors">
                    <input type="file" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const formData = new FormData();
                        formData.append("image", f);
                        fetch(`${API_URL}/upload`, { method: "POST", body: formData })
                          .then(r => r.json())
                          .then(d => setWorkingPhoto(p => p ? { ...p, url: d.url } : null));
                      }
                    }} />
                    Change photo
                  </label>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-slate-400 transition-colors">
                    <X size={28} />
                  </button>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden">
                {/* Canvas Area with Heart Shape Canvas logic */}
                <div className="flex-[1.2] bg-[#efefef] flex items-center justify-center overflow-hidden relative">
                  <div className="relative" style={{
                    width: '400px',
                    height: '400px',
                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.2))',
                    clipPath: selectedShape.toLowerCase().includes('heart')
                      ? 'url(#heart-clip)'
                      : selectedShape.toLowerCase().includes('hex')
                        ? 'url(#hexagon-clip)'
                        : selectedShape.toLowerCase().includes('circle')
                          ? 'url(#circle-clip)'
                          : 'none'
                  }}>
                    <div className="absolute inset-0 bg-white" />
                    <div className="absolute inset-0 overflow-hidden" style={{
                      borderRadius: selectedShape.toLowerCase().includes('circle') ? '50%' : (!selectedShape.toLowerCase().includes('heart') && !selectedShape.toLowerCase().includes('hex')) ? '4px' : '0'
                    }}>
                      {workingPhoto.url ? (
                        <DesignCanvas
                          design={selectedDesign}
                          shape={selectedShape}
                          photos={{ 0: workingPhoto }}
                          onAdjust={(idx: number, state: any) => setWorkingPhoto(state)}
                          isFinal={false}
                          apiUrl={API_URL}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 uppercase font-black tracking-widest">No Image</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls Area */}
                <div className="flex-1 bg-white p-12 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Zoom Slider */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                      <div className="flex items-center gap-6">
                        <span className="text-2xl text-slate-300 font-light cursor-pointer select-none" onClick={() => setWorkingPhoto(p => p ? { ...p, scale: Math.max(0.1, p.scale - 0.1) } : null)}>-</span>
                        <input
                          type="range" min="0.1" max="5.0" step="0.01"
                          value={workingPhoto.scale}
                          onChange={(e) => setWorkingPhoto(p => p ? { ...p, scale: parseFloat(e.target.value) } : null)}
                          className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#1877F2]"
                        />
                        <span className="text-xl text-slate-300 font-light cursor-pointer select-none" onClick={() => setWorkingPhoto(p => p ? { ...p, scale: Math.min(5, p.scale + 0.1) } : null)}>+</span>
                      </div>
                    </div>

                    {/* Quick Edit Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setWorkingPhoto(p => p ? { ...p, rotate: p.rotate - 90 } : null)}
                        className="h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <RotateCcw size={18} className="text-slate-400" /> 90°
                      </button>
                      <button
                        onClick={() => setWorkingPhoto(p => p ? { ...p, rotate: p.rotate + 90 } : null)}
                        className="h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <RotateCcw size={18} className="text-slate-400 scale-x-[-1]" /> 90°
                      </button>
                      <button
                        onClick={() => {
                          const img = document.querySelector('#editing-photo-ref') as HTMLImageElement;
                          if (img) setWorkingPhoto(p => p ? { ...p, scale: Math.min(400 / img.naturalWidth, 400 / img.naturalHeight), x: 0, y: 0 } : null);
                        }}
                        className="h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <div className="border-2 border-slate-300 w-4 h-3 rounded-sm" /> Fit
                      </button>
                      <button
                        onClick={() => {
                          const img = document.querySelector('#editing-photo-ref') as HTMLImageElement;
                          if (img) setWorkingPhoto(p => p ? { ...p, scale: Math.max(400 / img.naturalWidth, 400 / img.naturalHeight), x: 0, y: 0 } : null);
                        }}
                        className="h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Maximize2 size={18} className="text-slate-400" /> Fill
                      </button>
                    </div>

                    {/* Reset */}
                    <button
                      onClick={() => setWorkingPhoto(p => p ? { ...p, x: 0, y: 0, scale: 1, rotate: 0 } : null)}
                      className="w-full h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                    >
                      <RotateCcw size={16} /> Reset Crop & Rotation
                    </button>

                    {/* Main Actions */}
                    <div className="pt-10 flex gap-4">
                      <button
                        onClick={() => handleApply(true, singleEditIndex < totalFrames - 1 ? singleEditIndex + 1 : undefined)}
                        className="flex-1 h-14 bg-[#1877F2] hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Apply & Next <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => handleApply()}
                        className="flex-[1.5] h-14 bg-[#1877F2] hover:bg-blue-600 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unsaved Changes Prompt */}
            {showUnsavedPrompt && (
              <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#1e2124] text-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
                  <button onClick={() => setShowUnsavedPrompt(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-8">UNSAVED CHANGES ?</h3>
                  <div className="flex gap-4">
                    <button onClick={() => setShowUnsavedPrompt(false)} className="flex-1 py-3.5 bg-white text-slate-900 rounded-xl font-black text-sm uppercase transition-colors hover:bg-gray-100">Cancel</button>
                    <button onClick={() => pushQuery(selectedShape, designIdParam, totalFrames)} className="flex-1 py-3.5 bg-[#ef4444] text-white rounded-xl font-black text-sm uppercase transition-colors hover:bg-red-600">Discard</button>
                    <button onClick={() => handleApply()} className="flex-1 py-3.5 bg-[#1caf9c] text-white rounded-xl font-black text-sm uppercase transition-colors hover:bg-[#189b8a]">Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
  }


          // VIEW 3: EDITOR (Shape & Design Selected)
          const isLandscape = selectedShape.toLowerCase().includes('land') || selectedShape.toLowerCase().includes('horiz');
          const isPortrait = selectedShape.toLowerCase().includes('port') || selectedShape.toLowerCase().includes('vert');
          const canvasW = isLandscape ? 24 : isPortrait ? 18 : 20;
          const canvasH = isLandscape ? 18 : isPortrait ? 24 : 20;

          return (
          <div className="bg-gray-50 min-h-screen pb-10 border-t border-gray-200 font-sans">
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex gap-3">
                <Link href={`/studio-v2?category=${categoryParam}`} className="hover:text-red-500">{categoryParam.replace('-', ' ')}</Link>
                <span>/</span>
                <Link href={`/studio-v2?category=${categoryParam}&shape=${selectedShape}`} className="hover:text-red-500">{selectedShape}</Link>
                <span>/</span>
                <span className="text-gray-800">Customize</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
                {/* Canvas */}
                <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col pt-4 overflow-hidden h-[450px] md:h-[550px]">
                  <div className="flex justify-between items-center px-6 border-b border-gray-50 pb-4 mb-4">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</h2>
                    <div className="flex items-center gap-2 text-slate-300">
                      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="hover:text-blue-500 transition-colors"><ZoomOut size={16} /></button>
                      <div className="w-px h-3 bg-slate-100 mx-1"></div>
                      <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="hover:text-blue-500 transition-colors"><ZoomIn size={16} /></button>
                    </div>
                  </div>

                  <div className="flex-1 bg-[#FAF9F6] flex items-center justify-center overflow-hidden relative">
                    <div className="transition-transform duration-500 ease-out" style={{ transform: `scale(${zoom * 0.85})` }}>
                      <div id="studio-canvas-capture" className="shadow-2xl bg-white relative" style={{
                        width: `${canvasW * 25}px`,
                        height: `${canvasH * 25}px`,
                        clipPath: selectedShape.toLowerCase().includes('heart') ? 'url(#heart-clip)' : (selectedShape.toLowerCase().includes('hex') ? 'url(#hexagon-clip)' : (selectedShape.toLowerCase().includes('circle') ? 'url(#circle-clip)' : 'none')),
                        overflow: 'hidden'
                      }}>
                        <div className="absolute inset-0 bg-white" />
                        {selectedDesign && (
                          <DesignCanvas
                            design={selectedDesign}
                            shape={selectedShape}
                            photos={uploadedPhotos}
                            texts={texts}
                            icons={icons}
                            onUpdateText={(id: string, t: any) => setTexts(texts.map(tx => tx.id === id ? t : tx))}
                            onDeleteText={(id: string) => setTexts(texts.filter(t => t.id !== id))}
                            onUpdateIcon={(id: string, i: any) => setIcons(icons.map(ic => ic.id === id ? i : ic))}
                            onDeleteIcon={(id: string) => setIcons(icons.filter(i => i.id !== id))}
                            isFinal={isPreview || isCapturing}
                            isCapturing={isCapturing}
                            apiUrl={API_URL}
                            onUpload={(idx: number, url: string, init?: any) => handlePhotoUpload(idx, url, init)}
                            onAdjust={(idx: number, state: any) => setUploadedPhotos(p => ({ ...p, [idx]: state }))}
                            selectedSize={selectedSize}
                            dynamicShapes={dynamicShapes}
                            productCategory={categoryParam}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 h-fit">
                  <div className="border-b border-gray-100 pb-6 mb-6">
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-snug mb-2">
                      Custom Acrylic Photo Print
                    </h1>
                    <div className="flex items-end gap-3">
                      <p className="text-3xl font-black text-red-500">₹{displayPrice}</p>
                      <p className="text-sm text-gray-400 font-bold uppercase line-through mb-1">₹{Math.floor(displayPrice * 1.5)}</p>
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded mb-1 ml-2">Flat 10% Cashback</span>
                    </div>
                  </div>

                  {sizeOptions.length > 0 && (
                    <div className="space-y-3 border-b border-gray-100 pb-6">
                      <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center justify-between">
                        1. Select Size <span className="text-red-500">*</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {sizeOptions.map(size => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded font-bold text-xs uppercase transition-colors min-w-24
                                 ${selectedSize?.id === size.id ? 'border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pb-4">
                    <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center justify-between">
                      2. Upload Original Photos <span className="text-red-500">*</span>
                    </h3>
                    <label className={`w-full h-32 border-2 border-dashed flex flex-col items-center justify-center rounded cursor-pointer transition-colors
                     ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-red-300 hover:bg-red-50'}`}>
                      <input type="file" className="hidden" multiple onChange={handleUpload} disabled={isUploading} />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Optimizing Images...</span>
                        </div>
                      ) : (
                        <>
                          <CloudUpload className="text-red-500 mb-2" size={28} strokeWidth={1.5} />
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Tap here to Select Files</span>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleAddToCart}
                      disabled={isCapturing}
                      className="w-full h-14 bg-red-500 text-white rounded font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-red-600 shadow-lg"
                    >
                      {isCapturing ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={18} /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              </div>
            </main>

            {showMediaPicker && (
              <MediaPicker
                onSelect={() => { }}
                multiple
                onSelectMultiple={handleSavedMediaSelect}
                onClose={() => setShowMediaPicker(false)}
              />
            )}
            {/* Global SVG Definitions (Masks) */}
            <svg width="0" height="0" className="absolute pointer-events-none opacity-0">
              <defs>
                <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.5 0.9 C 0.1 0.6, 0 0.4, 0 0.25 C 0 0.1, 0.15 0, 0.3 0 C 0.4 0, 0.45 0.05, 0.5 0.15 C 0.55 0.05, 0.6 0, 0.7 0 C 0.85 0, 1 0.1, 1 0.25 C 1 0.4, 0.9 0.6, 0.5 0.9" />
                </clipPath>
                <clipPath id="hexagon-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.25 0 L 0.75 0 L 1 0.5 L 0.75 1 L 0.25 1 L 0 0.5 Z" />
                </clipPath>
                <clipPath id="circle-clip" clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.5" />
                </clipPath>
              </defs>
            </svg>
          </div>
          );
}
