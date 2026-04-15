"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ChevronLeft, Save, Loader2, AlertCircle, Package, 
  Trash2, Plus, X, Grid3X3, Image as ImageIcon, 
  Layers, ArrowUpRight, Layout, Images, Monitor, 
  Smartphone, ShieldCheck, Settings, Sparkles, Filter
} from "lucide-react";
import Link from "next/link";
import MediaPicker from "@/components/MediaPicker";

type ProductType = "SIMPLE" | "VARIABLE" | "GROUPED" | "EXTERNAL";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Variation {
  id?: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  image: string;
  attributes: Record<string, string>;
}

export default function EditProductPage() {
  const router = useRouter(); const params = useParams(); const id = params.id;
  const [loading, setLoading] = useState(true); 
  const [isMatrixVisible, setIsMatrixVisible] = useState(true);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [status, setStatus] = useState('DRAFT');
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [productType, setProductType] = useState<ProductType>('SIMPLE');
  const [selectedBrand, setSelectedBrand] = useState(""); const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState(""); const [gallery, setGallery] = useState<string[]>([]);
  const [pricing, setPricing] = useState({ regularPrice: "", salePrice: "" });
  const [inventory, setInventory] = useState({ sku: "", stockQuantity: 0, stockStatus: "IN_STOCK", trackInventory: true });
  const [shipping, setShipping] = useState({ weight: "", length: "", width: "", height: "" });
  const [shortDescription, setShortDescription] = useState(""); const [description, setDescription] = useState("");
  const [isVirtual, setIsVirtual] = useState(false); const [isDownloadable, setIsDownloadable] = useState(false);
  const [isReadyToSale, setIsReadyToSale] = useState(false);
  const [isSoldIndividually, setIsSoldIndividually] = useState(false);
  const [minPhotos, setMinPhotos] = useState<number>(0);
  const [maxPhotos, setMaxPhotos] = useState<number>(0);
  const [tags, setTags] = useState("");
  const [attributes, setAttributes] = useState<{name: string, values: string[], usedForVariations: boolean}[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<{name: string, values: string[], usedForVariations: boolean}[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [pickerOpen, setPickerOpen] = useState<"main" | "gallery" | "variant" | null>(null);
  const [updatingImageIndex, setUpdatingImageIndex] = useState<number | null>(null);
  const [expandedVar, setExpandedVar] = useState<number | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [productRes, categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_URL}/products/${id}`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/brands`)
      ]);
      const data = await productRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      setAllBrands(brandsData);
      setAllCategories(categoriesData);
      
      if (data && data.id) {
        const defaultVar = data.variants?.find((v: { isDefault: boolean }) => v.isDefault) || data.variants?.[0];
        setName(data.name || "");
        setSlug(data.slug || "");
        setProductType(data.productType || 'SIMPLE');
        setStatus(data.status || 'DRAFT');
        setSelectedCategories(data.categoryId ? [data.categoryId] : []);
        setMainImage(data.mainImage || "");
        
        const regPrice = data.regularPrice || defaultVar?.price || "0";
        const slPrice = data.salePrice || defaultVar?.salePrice || "";
        setPricing({ regularPrice: regPrice.toString(), salePrice: slPrice.toString() });
        
        setInventory({ 
          sku: data.sku || defaultVar?.sku || "", 
          stockQuantity: (data.stock ?? defaultVar?.stock ?? 0).toString(), 
          stockStatus: data.stockStatus || defaultVar?.stockStatus || "IN_STOCK", 
          trackInventory: data.trackInventory ?? true 
        });
        
        setShortDescription(data.shortDescription || "");
        setDescription(data.description || "");
        setIsReadyToSale(data.isReadyToSale || false);
        setIsSoldIndividually(data.soldIndividually || false);
        setMinPhotos(data.minPhotos || 0);
        setMaxPhotos(data.maxPhotos || 0);
        setTags(data.tags || "");
        setShipping({ 
          weight: (data.weight ?? defaultVar?.weight ?? "").toString(), 
          length: (data.length ?? defaultVar?.length ?? "").toString(), 
          width: (data.width ?? defaultVar?.width ?? "").toString(), 
          height: (data.height ?? defaultVar?.height ?? "").toString() 
        });
        
        if (data.images) {
          try {
             const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
             setGallery(Array.isArray(parsed) ? parsed : []);
          } catch(e) { setGallery([]); }
        }
        
        if (data.attributes) {
           const mappedAttrs = (data.attributes || []).map((a: { name: string, options?: { value: string }[], values?: string[], visible?: boolean, usedForVariations?: boolean }) => ({
               name: a.name,
               values: a.options?.map(o => o.value) || a.values || [],
               visible: a.visible ?? true,
               usedForVariations: a.usedForVariations ?? true
           }));
           setAttributes(mappedAttrs);
        }
        
        const cat = data.categories?.[0] || data.category;
        if (cat?.categoryAttributes) { 
          setCategoryAttributes(cat.categoryAttributes.map((v: any) => ({ 
            name: v.name, 
            values: v.attributeOptions?.map((o: any) => o.value) || v.values || [], 
            usedForVariations: true 
          }))); 
        }
        
        setVariations(data.variants?.map((v: any) => ({ 
          id: v.id, 
          sku: v.sku, 
          price: v.price?.toString() || "", 
          salePrice: v.salePrice?.toString() || "", 
          stock: v.stock?.toString() || "0", 
          weight: v.weight?.toString() || "", 
          length: v.length?.toString() || "", 
          width: v.width?.toString() || "", 
          height: v.height?.toString() || "", 
          image: v.image || "", 
          attributes: v.variantAttributes?.reduce((acc: Record<string, string>, attr: { attributeName: string, attributeValue: string }) => ({ ...acc, [attr.attributeName]: attr.attributeValue }), {}) || v.attributes?.reduce((acc: Record<string, string>, attr: { name: string, value: string }) => ({ ...acc, [attr.name]: attr.value }), {}) || {} 
        })) || []);
      }
      setLoading(false);
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const generateVariations = () => {
    setIsMatrixVisible(true);
    const available = [
      ...categoryAttributes,
      ...attributes
    ].filter(a => (a.values || []).some((v: string) => v.trim() !== ""));

    const activeAttrs = available.filter(a => a.usedForVariations !== false);

    if (activeAttrs.length === 0) {
      console.warn("No active attributes with values found for generation");
      return;
    }

    const combinations = activeAttrs.reduce((acc: Record<string, string>[], attr) => {
      const field = attr.name; 
      const vals = (attr.values || []).filter((v: string) => v.trim() !== "");
      if (acc.length === 0) return vals.map((v: string) => ({ [field]: v }));
      return acc.flatMap((combo: Record<string, string>) => vals.map((v: string) => ({ ...combo, [field]: v })));
    }, [] as Record<string, string>[]);

    let finalCombos = combinations;

    // --- CROSS-CATEGORY MATRIX FILTER ---
    const matrixAttr = categoryAttributes.find(a => a.name.toLowerCase().includes('matrix'));
    if (matrixAttr && matrixAttr.values?.[0]) {
      try {
        const specMatrix = JSON.parse(matrixAttr.values[0]);
        finalCombos = combinations.filter(combo => {
          // Standardize keys for comparison
          const findVal = (n: string) => {
            const k = Object.keys(combo).find(key => key.toLowerCase().includes(n.toLowerCase()));
            return k ? combo[k] : null;
          };

          const shName = findVal('shape');
          const szName = findVal('size');
          const thName = findVal('thickness');
          const mtName = findVal('mounting');

          if (!shName || !szName) return true; // Can't filter without core specs

          // Find the shape mapping key. We need the shape's original ID or name pattern.
          // Since specMatrix keys are often "temp-ID" or "ShapeName", we try to find a match.
          const matrixKey = Object.keys(specMatrix).find(k => k.toLowerCase().includes(shName.toLowerCase()) && k.includes(szName));
          
          if (!matrixKey) return true; // No specific constraint for this pair

          const constraints = specMatrix[matrixKey];
          
          // If thickness is defined in combo, it MUST be in the matrix's authorized list
          if (thName && constraints.t && constraints.t.length > 0) {
             if (!constraints.t.includes(thName)) return false;
          }

          // If mounting is defined, it MUST be authorized
          if (mtName && constraints.m && constraints.m.length > 0) {
             if (!constraints.m.includes(mtName)) return false;
          }

          return true; 
        });
      } catch (e) {
        console.error("Matrix Sync Failure:", e);
      }
    }

    setVariations(finalCombos.map((combo: Record<string, string>) => {
      const normalizedCombo = { ...combo };
      const shapeAttr = Object.keys(combo).find(k => k.toLowerCase() === 'shape' || k.toLowerCase() === 'orientation');
      const sizeAttr = Object.keys(combo).find(k => k.toLowerCase() === 'size');
      
      if (shapeAttr && sizeAttr && normalizedCombo[sizeAttr].includes('X')) {
        const dims = normalizedCombo[sizeAttr].split('X');
        if (dims.length === 2) {
          const w = parseInt(dims[0]);
          const h = parseInt(dims[1]);
          if (!isNaN(w) && !isNaN(h)) {
             const shapeVal = normalizedCombo[shapeAttr].toLowerCase();
             if (shapeVal.includes('landscape') && w < h) { normalizedCombo[sizeAttr] = `${h}X${w}`; } 
             else if (shapeVal.includes('portrait') && w > h) { normalizedCombo[sizeAttr] = `${h}X${w}`; }
          }
        }
      }

      const existing = variations.find(v => 
        Object.entries(normalizedCombo).every(([key, val]) => {
          if (!v.attributes) return false;
          const vKey = Object.keys(v.attributes).find(k => k.toLowerCase() === key.toLowerCase());
          return vKey && v.attributes[vKey] === val;
        })
      );

      const skuSegments: string[] = [];
      const findVal = (name: string) => {
        const key = Object.keys(normalizedCombo).find(k => k.toLowerCase() === name.toLowerCase());
        return key ? normalizedCombo[key] : null;
      };

      const shapeVal = findVal('Shape');
      const sizeVal = findVal('Size');
      const thickVal = findVal('Thickness');
      const mountVal = findVal('Mounting');

      if (shapeVal) skuSegments.push(shapeVal.substring(0, 3).toUpperCase());
      if (sizeVal) skuSegments.push(sizeVal.replace(/[^0-9X]/g, '').toUpperCase());
      if (thickVal) skuSegments.push(thickVal.replace(/[^0-9]/g, '') + 'MM');
      if (mountVal) skuSegments.push(mountVal.split(' ')[0].substring(0, 2).toUpperCase());

      const comboPath = skuSegments.join('-');
      const generatedSku = inventory.sku ? `${inventory.sku}-${comboPath}`.toUpperCase() : comboPath.toUpperCase();
      
      return existing || { 
        sku: generatedSku, 
        price: pricing.salePrice || pricing.regularPrice || "0", 
        salePrice: "", 
        stock: "10", 
        weight: "",
        length: "",
        width: "",
        height: "",
        image: "",
        attributes: normalizedCombo 
      };
    }));
  };

  const handleSave = async () => {
    setError(""); setLoading(true); setSuccess("");
    if (!name.trim()) { setError("Product Title is mandatory"); setLoading(false); return; }
    if (!description.trim()) { setError("Product Narrative (Description) is mandatory"); setLoading(false); return; }
    if (selectedCategories.length === 0) { setError("Department selection is mandatory"); setLoading(false); return; }
    if (!mainImage) { setError("Main Product Image is mandatory"); setLoading(false); return; }
    if (!inventory.sku.trim()) { setError("Base SKU is mandatory for system tracking"); setLoading(false); return; }
    if (!tags.trim()) { setError("Layout Tags are mandatory for homepage curation"); setLoading(false); return; }

    const payload = {
      name, slug, description, shortDescription, productType, status,
      mainImage, images: JSON.stringify(gallery), categoryId: selectedCategories[0],
      regularPrice: pricing.regularPrice, salePrice: pricing.salePrice, sku: inventory.sku,
      trackInventory: inventory.trackInventory, stockQuantity: inventory.stockQuantity.toString(),
      stockStatus: inventory.stockStatus, ...shipping, tags, isVirtual, isDownloadable,
      isReadyToSale, isSoldIndividually, minPhotos, maxPhotos,
      productAttributes: attributes.map(a => ({ name: a.name, type: "SELECT", usedForVariations: a.usedForVariations, options: a.values.map(v => ({ value: v })) })),
      variants: variations.map((v: Variation) => ({ 
        ...v, 
        price: parseFloat(v.price) || 0, 
        salePrice: v.salePrice ? parseFloat(v.salePrice) : null, 
        stock: parseInt(v.stock) || 0, 
        attributes: Object.entries(v.attributes).map(([name, value]) => ({ name, value })) 
      }))
    };

    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed up update product");
      setSuccess("Product information updated.");
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#282c3f] pb-20 font-inter">
      <header className="sticky top-0 z-50 bg-white/80 border-b border-slate-300/60 px-8 py-5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-slate-900 shadow-sm"><ChevronLeft size={20} /></button>
          <div className="flex flex-col">
            <label className="text-[11px] text-slate-900 capitalize tracking-widest mb-1 pl-1">Product Title</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Acrylic Wall Art" className="text-xl font-medium bg-transparent border-none outline-none w-[450px] border-b border-transparent focus:border-slate-300 transition-all pb-1" />
          </div>
        </div>
        <div className="flex gap-3">
          <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm">
             <option value="PUBLISHED">PUBLISHED</option>
             <option value="DRAFT">DRAFT</option>
             <option value="PENDING">PENDING</option>
          </select>
          <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white text-[11px] capitalize tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2.5">
             {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update Listing
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-12">
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm space-y-6">
                     <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4">Core Logistics</p>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architecture</label>
                        <select value={productType} onChange={e => setProductType(e.target.value as ProductType)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 text-sm">{['SIMPLE','VARIABLE','EXTERNAL'].map(t => <option key={t} value={t}>{t}</option>)}</select>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isVirtual} onChange={e => setIsVirtual(e.target.checked)} className="w-5 h-5 rounded" /><span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Virtual Asset</span></label>
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isDownloadable} onChange={e => setIsDownloadable(e.target.checked)} className="w-5 h-5 rounded" /><span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Downloadable</span></label>
                     </div>
                  </div>
                  <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm space-y-6">
                     <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4">Pricing Engine</p>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retail (₹)</label><input type="number" value={pricing.regularPrice} onChange={e => setPricing({...pricing, regularPrice: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xl text-slate-900" /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sale (₹)</label><input type="number" value={pricing.salePrice} onChange={e => setPricing({...pricing, salePrice: e.target.value})} className="w-full p-4 bg-blue-50/50 rounded-2xl font-black text-xl text-blue-600" /></div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm space-y-8">
                  <div className="flex items-center justify-between"><h3 className="text-xl font-black text-slate-950 tracking-tighter uppercase">Marketing Narrative</h3><div className="w-12 h-1 bg-blue-600 rounded-full" /></div>
                  <div className="space-y-6">
                     <div className="space-y-3"><label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Summary</label><textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={3} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" /></div>
                     <div className="space-y-3"><label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Detailed Specifications</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[3rem] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all font-inter" /></div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm space-y-8">
                  <div className="aspect-video bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 relative group cursor-pointer" onClick={() => setPickerOpen("main")}>
                     {mainImage ? <img src={getImageUrl(mainImage)} className="w-full h-full object-cover" /> : <div className="h-full flex flex-col items-center justify-center text-slate-300"><ImageIcon size={40} /><p className="text-[11px] font-black uppercase mt-4">Select Hero Asset</p></div>}
                     <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><p className="text-white text-[12px] font-black uppercase">Change Image</p></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                     {gallery.map((img, i) => <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group relative"><img src={getImageUrl(img)} className="w-full h-full object-cover" /><button onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button></div>)}
                     <button onClick={() => setPickerOpen("gallery")} className="aspect-square bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"><Plus size={20} /></button>
                  </div>
               </div>

               <div className="bg-blue-600 rounded-[40px] p-8 space-y-6 shadow-2xl shadow-blue-200 border-b-8 border-blue-800">
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-blue-100 uppercase tracking-widest pl-1">Department Mapping</label>
                     <select value={selectedCategories[0]} onChange={e => setSelectedCategories([e.target.value])} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl font-black text-white text-base outline-none">{allCategories.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name.toUpperCase()}</option>)}</select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-blue-100 uppercase tracking-widest pl-1">Inventory SKU <span className="text-white underline underline-offset-4 decoration-emerald-400">Fixed</span></label>
                     <input value={inventory.sku} onChange={e => setInventory({...inventory, sku: e.target.value})} className="w-full p-4 bg-white font-black text-blue-600 text-lg rounded-2xl outline-none shadow-inner" />
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[40px] p-8 space-y-8 shadow-sm">
                  <div className="px-1 text-center">
                     <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-1">Layout Tags <span className="text-blue-400">*</span></h4>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">For Homepage Discoverability</p>
                  </div>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="BEST SELLERS, POPULAR, NEW" className="w-full py-4 bg-white/5 border border-white/10 rounded-3xl font-black text-[12px] text-center text-white outline-none placeholder:text-slate-600 focus:border-blue-500 transition-all shadow-inner uppercase tracking-widest font-inter" />
               </div>
            </div>

            {productType === "VARIABLE" && (
               <div className="col-span-12 mt-12">
                  <div className="bg-white rounded-[48px] border border-slate-300/60 shadow-2xl overflow-hidden mb-10 transition-all">
                     <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl rotate-3"><Layers size={28} /></div>
                           <div>
                              <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-none mb-1 uppercase">Variation Master</h2>
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Controlling {variations.length} unique combinations</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setAttributes([...attributes, { name: "", values: [], usedForVariations: true }])} className="px-8 py-3.5 bg-white border-2 border-slate-100 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Append Attr</button>
                           <button onClick={generateVariations} className="px-12 py-3.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">GENERATE VARIANCES</button>
                        </div>
                     </div>

                     <div className="p-10 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {categoryAttributes.map((attr, idx) => (
                              <div key={`cat-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-300 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                 <div><p className="text-[10px] font-black text-indigo-600 uppercase mb-1 leading-none tracking-widest">Asset Class</p><h5 className="text-[16px] font-black text-slate-950 tracking-tight">{attr.name}</h5><p className="text-[11px] font-medium text-slate-900/60 mt-1">{(attr.values || []).join(' | ')}</p></div>
                                 <input type="checkbox" checked={attr.usedForVariations} onChange={e => { const u = [...categoryAttributes]; u[idx].usedForVariations = e.target.checked; setCategoryAttributes(u); }} className="w-6 h-6 rounded-lg text-indigo-600 border-slate-300 cursor-pointer" />
                              </div>
                           ))}
                           {attributes.map((attr, i) => (
                              <div key={`custom-${i}`} className="bg-white p-6 rounded-3xl border border-slate-300 space-y-4 shadow-md relative group hover:border-[#ff3f6c] transition-all">
                                 <div className="flex justify-between items-start">
                                    <input value={attr.name} onChange={e => { const u = [...attributes]; u[i].name = e.target.value; setAttributes(u); }} placeholder="NAME: e.g. Color" className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-black text-sm text-slate-950 outline-none" />
                                    <div className="flex items-center gap-2">
                                       <input type="checkbox" checked={attr.usedForVariations} onChange={e => { const u = [...attributes]; u[i].usedForVariations = e.target.checked; setAttributes(u); }} className="w-5 h-5 rounded-md text-indigo-600 border-slate-300 cursor-pointer" />
                                       <button onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500"><Trash2 size={20} /></button>
                                    </div>
                                 </div>
                                 <input value={(attr.values || []).join(' | ')} onChange={e => { const u = [...attributes]; u[i].values = e.target.value.split('|').map(v => v.trim()); setAttributes(u); }} placeholder="VALUES: Black | White | Red" className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 font-black text-[11px] uppercase tracking-[0.2em] outline-none" />
                              </div>
                           ))}
                        </div>

                        {isMatrixVisible && variations.length > 0 && (
                           <div className="border border-slate-300 rounded-[3rem] overflow-hidden bg-white shadow-2xl transition-all animate-in fade-in slide-in-from-top-4">
                              <div className="overflow-x-auto custom-scrollbar">
                                 <div className="min-w-[1400px]">
                                    <div className="bg-blue-600 px-10 py-6 grid grid-cols-12 gap-6 items-center">
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Identity</div>
                                       <div className="col-span-2 text-[11px] font-black text-blue-100 uppercase tracking-widest">Attribute Map</div>
                                       <div className="col-span-3 text-[11px] font-black text-blue-100 uppercase tracking-widest">Inventory SKU</div>
                                       <div className="col-span-4 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Retail Price (₹)         Sale Price (₹)</div>
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Stock</div>
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-right">Action</div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                       {variations.map((v, i) => (
                                          <div key={`var-${i}`} className="px-10 py-6 grid grid-cols-12 gap-6 items-center hover:bg-slate-50 transition-colors">
                                             <div className="col-span-1 flex justify-center">
                                                <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-1 relative group">
                                                   {getImageUrl(v.image || mainImage) && <img src={getImageUrl(v.image || mainImage)} className="w-full h-full object-cover rounded-xl" />}
                                                   <div onClick={() => { setUpdatingImageIndex(i); setPickerOpen("variant"); }} className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><Images size={16} className="text-white" /></div>
                                                </div>
                                             </div>
                                             <div className="col-span-2 flex flex-wrap gap-1">
                                                {Object.entries(v.attributes).map(([k, val]) => (
                                                   <div key={k} className="flex flex-col"><span className="text-[8px] font-black text-slate-900 uppercase leading-none mb-0.5">{k}</span><span className="px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase">{val}</span></div>
                                                ))}
                                             </div>
                                             <div className="col-span-3"><input value={v.sku} onChange={e => { const u = [...variations]; u[i].sku = e.target.value; setVariations(u); }} className="w-full h-12 px-5 bg-white border border-slate-300 rounded-2xl font-black text-[12px] uppercase shadow-sm outline-none" /></div>
                                             <div className="col-span-4 flex gap-4">
                                                <div className="flex-1 relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-900">₹</span><input value={v.price} onChange={e => { const u = [...variations]; u[i].price = e.target.value; setVariations(u); }} className="w-full h-12 pl-8 pr-4 bg-white border border-slate-300 rounded-2xl font-black text-lg text-slate-950 shadow-sm shadow-inner outline-none" /></div>
                                                <div className="flex-1 relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-blue-600">₹</span><input value={v.salePrice} onChange={e => { const u = [...variations]; u[i].salePrice = e.target.value; setVariations(u); }} className="w-full h-12 pl-8 pr-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-lg text-blue-600 shadow-sm shadow-inner outline-none" /></div>
                                             </div>
                                             <div className="col-span-1"><input value={v.stock} onChange={e => { const u = [...variations]; u[i].stock = e.target.value; setVariations(u); }} className="w-full h-12 bg-white border border-slate-300 rounded-2xl text-lg font-black text-slate-950 text-center shadow-sm outline-none" /></div>
                                             <div className="col-span-1 flex justify-end gap-2">
                                                <button onClick={() => setExpandedVar(expandedVar === i ? null : i)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Settings size={20} /></button>
                                                <button onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                                             </div>
                                             {expandedVar === i && (
                                                <div className="col-span-12 p-10 bg-slate-50/80 rounded-[3rem] border border-slate-100 mt-6 grid grid-cols-4 gap-8 animate-in fade-in zoom-in-95 duration-300">
                                                   {['weight', 'length', 'width', 'height'].map(f => <div key={f} className="space-y-3"><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2">{f.toUpperCase()} (KG/CM)</p><input value={(v as any)[f] || ""} onChange={e => { const u = [...variations]; (u[i] as any)[f] = e.target.value; setVariations(u); }} className="w-full h-14 px-6 bg-white border-2 border-white rounded-[2rem] font-black text-slate-950 text-center outline-none shadow-sm focus:border-indigo-100 text-lg" /></div>)}
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </main>

      {success && <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-12 py-6 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex items-center gap-6 animate-in slide-in-from-bottom-20 z-[100] border border-white/10 backdrop-blur-xl"><ShieldCheck size={32} className="text-emerald-400" /><p className="text-[18px] font-black tracking-tighter">{success}</p></div>}
      {error && <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-12 py-6 rounded-[3rem] shadow-[0_30px_100px_rgba(255,0,0,0.2)] flex items-center gap-6 animate-in slide-in-from-bottom-20 z-[100] border border-white/10"><AlertCircle size={28} /><p className="text-[18px] font-black tracking-tighter">{error}</p></div>}

      {pickerOpen && (
        <MediaPicker 
          onClose={() => setPickerOpen(null)}
          onSelect={(url) => {
            if (pickerOpen === "main") setMainImage(url);
            else if (pickerOpen === "variant" && updatingImageIndex !== null) {
               const u = [...variations];
               u[updatingImageIndex].image = url;
               setVariations(u);
            }
            setPickerOpen(null);
          }}
          multiple={pickerOpen === "gallery"}
          onSelectMultiple={(urls) => {
            if (pickerOpen === "gallery") setGallery(prev => [...prev, ...urls].slice(0, 8));
            setPickerOpen(null);
          }}
        />
      )}
    </div>
  );
}
