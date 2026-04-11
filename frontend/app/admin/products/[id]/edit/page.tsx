'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, Trash2, ImageIcon, 
  Settings, Grid3X3, Package, Truck, Zap, 
  AlertCircle, ShieldCheck, Layout, History, 
  CheckSquare, X, Minus, Loader2, Layers
} from 'lucide-react';
import Link from 'next/link';

// ULTRA-COMPACT UI KIT
function Card({ sectionIcon, title, subTitle, children, className }: any) {
  return (
    <div className={`bg-white rounded-[24px] p-6 border border-slate-300 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] space-y-5 ${className}`}>
      {(title || sectionIcon) && (
         <div className="flex items-center gap-4">
            {sectionIcon && <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 shadow-sm">{sectionIcon}</div>}
            <div className="flex-1">
               <h3 className="text-[12px] font-black text-slate-950 uppercase tracking-widest leading-none">{title}</h3>
               {subTitle && <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest opacity-90 leading-none mt-1.5">{subTitle}</p>}
            </div>
         </div>
      )}
      <div className="pt-1">{children}</div>
    </div>
  );
}

type ProductType = 'SIMPLE' | 'VARIABLE';
interface Attribute { name: string; values: string[]; visible: boolean; usedForVariations: boolean; }
interface Variation { id?: string; sku: string; price: string; salePrice: string; stock: string; weight?: string; length?: string; width?: string; height?: string; image?: string; attributes: Record<string, string>; }

export default function EditProductPage() {
  const router = useRouter(); const params = useParams(); const id = params.id;
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [status, setStatus] = useState('DRAFT');
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [productType, setProductType] = useState<ProductType>('SIMPLE');
  const [selectedBrand, setSelectedBrand] = useState(""); const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState(""); const [gallery, setGallery] = useState<string[]>([]);
  const [pricing, setPricing] = useState({ regularPrice: "", salePrice: "" });
  const [inventory, setInventory] = useState({ sku: "", stockStatus: "IN_STOCK", stockQuantity: 0, trackInventory: true });
  const [shortDescription, setShortDescription] = useState(""); const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]); const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]); const [expandedVar, setExpandedVar] = useState<number | null>(null);
  const [shipping, setShipping] = useState({ weight: "", length: "", width: "", height: "" });
  const [allBrands, setAllBrands] = useState<any[]>([]); const [allCategories, setAllCategories] = useState<any[]>([]);
  const [tags, setTags] = useState("");
  const [isReadyToSale, setIsReadyToSale] = useState(false);
  const [isSoldIndividually, setIsSoldIndividually] = useState(false);
  const [minPhotos, setMinPhotos] = useState<number>(0);
  const [maxPhotos, setMaxPhotos] = useState<number>(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  };

  useEffect(() => { fetchInitialData(); }, [id]);
  const fetchInitialData = async () => {
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        fetch(`${API_URL}/products/${id}`), 
        fetch(`${API_URL}/brands`), 
        fetch(`${API_URL}/categories`)
      ]);
      
      if (!pRes.ok) throw new Error("Product fetch failure");
      
      const data = await pRes.json();
      const brandsData = await bRes.json();
      const categoriesData = await cRes.json();
      
      setAllBrands(brandsData);
      setAllCategories(categoriesData);
      
      if (data && data.id) {
        // Extract default variant values if they exist (since SKU/Stock are on variants)
        const defaultVar = data.variants?.find((v: any) => v.isDefault) || data.variants?.[0];
        
        setName(data.name || "");
        setSlug(data.slug || "");
        setProductType(data.productType || "SIMPLE");
        setStatus(data.status || "PUBLISHED");
        setSelectedBrand(data.brandId || "");
        setSelectedCategories(data.categoryId ? [data.categoryId] : []);
        setMainImage(data.mainImage || "");
        
        // Use variant prices if main product prices are missing/null
        const regPrice = data.regularPrice || defaultVar?.price || "0";
        const slPrice = data.salePrice || defaultVar?.salePrice || "";
        
        setPricing({ 
          regularPrice: regPrice.toString(), 
          salePrice: slPrice.toString() 
        });
        
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
           const mappedAttrs = (data.attributes || []).map((a: any) => ({
               name: a.name,
               values: a.options?.map((o: any) => o.value) || a.values || [],
               visible: a.visible ?? true,
               usedForVariations: a.usedForVariations ?? true
           }));
           setAttributes(mappedAttrs);
        }
        
        if (data.categories?.[0]?.variances) { 
          setCategoryAttributes(data.categories[0].variances.map((v: any) => ({ name: v.name, values: v.values || [], usedForVariations: true }))); 
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
          attributes: v.variantAttributes?.reduce((acc: any, attr: any) => ({ ...acc, [attr.attributeName]: attr.attributeValue }), {}) || v.attributes?.reduce((acc: any, attr: any) => ({ ...acc, [attr.name]: attr.value }), {}) || {} 
        })) || []);
      }
      setLoading(false);
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  const generateVariations = () => {
    // Collect all attributes that have at least one value
    const available = [
      ...categoryAttributes,
      ...attributes
    ].filter(a => (a.values || []).some((v: string) => v.trim() !== ""));

    // Filter for those specifically marked for variations (default to true if not specified)
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

    setVariations(combinations.map((combo: Record<string, string>) => {
      const existing = variations.find(v => 
        Object.entries(combo).every(([key, val]) => v.attributes && v.attributes[key] === val)
      );
      return existing || { 
        sku: `${inventory.sku}-${Object.values(combo).join('-')}`.toUpperCase(), 
        price: pricing.salePrice || pricing.regularPrice || "0", 
        salePrice: "", 
        stock: "10", 
        attributes: combo 
      };
    }));
  };

  const handleSave = async () => {
    setError("");
    setLoading(true); setError(""); setSuccess("");

    // GLOBAL MANDATORY VALIDATION
    if (!name.trim()) { setError("Product Title is mandatory"); setLoading(false); return; }
    if (!description.trim()) { setError("Product Narrative (Description) is mandatory"); setLoading(false); return; }
    if (selectedCategories.length === 0) { setError("Department selection is mandatory"); setLoading(false); return; }
    if (!mainImage) { setError("Main Product Image is mandatory"); setLoading(false); return; }
    if (!inventory.sku.trim()) { setError("Base SKU is mandatory for system tracking"); setLoading(false); return; }
    if (!tags.trim()) { setError("Layout Tags are mandatory for homepage curation"); setLoading(false); return; }
    
    if (productType?.toUpperCase() === 'SIMPLE') {
       if (!pricing.regularPrice || parseFloat(pricing.regularPrice) <= 0) {
         setError("Retail Price must be greater than zero"); setLoading(false); return;
       }
       if (!inventory.stockQuantity || parseInt(inventory.stockQuantity.toString()) <= 0) {
         setError("Stock Quantity cannot be zero for single products"); setLoading(false); return;
       }
    } else if (productType?.toUpperCase() === 'VARIABLE') {
       if (variations.length === 0) {
         setError("Variation generation is mandatory for variable products"); setLoading(false); return;
       }
       const invalidVar = variations.find(v => !v.price || parseFloat(v.price) <= 0 || !v.stock || parseInt(v.stock?.toString()) <= 0);
       if (invalidVar) {
         setError("All variations must have a price and a stock count greater than zero"); setLoading(false); return;
       }
    }

    try {
      const payload = { 
        name: name || "", 
        slug: slug || "", 
        productType: productType || "SIMPLE", 
        status: status || "DRAFT", 
        isVirtual: productType === 'VARIABLE',
        isDownloadable: false,
        isReadyToSale,
        soldIndividually: isSoldIndividually,
        minPhotos,
        maxPhotos,
        brandId: selectedBrand || null, 
        categoryId: (selectedCategories && selectedCategories.length > 0) ? selectedCategories[0] : null, 
        mainImage: mainImage || "", 
        images: gallery || [], 
        regularPrice: parseFloat(pricing.regularPrice) || 0, 
        salePrice: parseFloat(pricing.salePrice) || 0, 
        sku: inventory.sku || null, 
        stock: parseInt(inventory.stockQuantity?.toString() || "0") || 0,
        stockStatus: inventory.stockStatus || "IN_STOCK", 
        trackInventory: inventory.trackInventory ?? true, 
        shortDescription: shortDescription || "", 
        description: description || "", 
        tags: tags || "", 
        weight: parseFloat(shipping.weight || "0") || 0, 
        length: parseFloat(shipping.length || "0") || 0, 
        width: parseFloat(shipping.width || "0") || 0, 
        height: parseFloat(shipping.height || "0") || 0, 
        productAttributes: (attributes || []).map(a => ({ name: a.name, values: a.values, usedForVariations: a.usedForVariations })),
        variants: productType?.toUpperCase() === 'VARIABLE' ? (variations || []).map(v => ({ 
          id: v.id,
          price: parseFloat(v.price || "0") || 0, 
          salePrice: v.salePrice ? parseFloat(v.salePrice) : null, 
          stock: parseInt(v.stock?.toString() || "0") || 0, 
          sku: v.sku || "",
          weight: parseFloat(v.weight || "0"), 
          length: parseFloat(v.length || "0"), 
          width: parseFloat(v.width || "0"), 
          height: parseFloat(v.height || "0"),
          attributes: v.attributes ? Object.entries(v.attributes).map(([name, value]) => ({ name, value })) : []
        })) : []
      };
      
      const res = await fetch(`${API_URL}/products/${id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Critical: Server returned non-JSON (${res.status})`);
      }

      if (!res.ok) {
        const msg = data.code 
          ? `DB<${data.code}>: ${data.description || data.error || 'Sync Failure'}`
          : (data.error || `Sync Failure (${res.status})`);
        setError(msg);
        setLoading(false);
        return;
      }

      setSuccess("Catalog architecture synced"); 
      setTimeout(() => {
         setSuccess("");
         window.location.reload();
      }, 1000);
    } catch (err: any) { 
      console.error("Save Crash Details:", err);
      setError(err.message || "Unknown synchronization error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeleteProduct = async () => {
     const firstCheck = confirm(`Are you sure you want to delete "${name}"? This will remove the catalog entry permanently.`);
     if (!firstCheck) return;
     
     const secondCheck = confirm(`DANGER: This action will permanently delete this product and all its variants. This CANNOT be undone. Are you absolutely sure?`);
     if (!secondCheck) return;

     setLoading(true);
     try {
       const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
       if (!res.ok) throw new Error("Failed to delete product");
       router.push("/admin/products");
     } catch (e: any) {
       setError(e.message);
       setLoading(false);
     }
  };

  const handleAddBrand = async () => {
    const name = window.prompt("Enter new brand name:");
    if (!name) return;
    try {
      const res = await fetch(`${API_URL}/brands`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (res.ok) {
        const brandsRes = await fetch(`${API_URL}/brands`);
        const brandsData = await brandsRes.json();
        setAllBrands(brandsData);
        setSuccess("Brand identity forged"); setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) { setError("Failed to establish brand"); }
  };

  if (loading && !name) return <div className="h-screen flex items-center justify-center bg-[#f8f9fb]"><Loader2 className="w-8 h-8 animate-spin text-[#ff3f6c]" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#282c3f] font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-300/60 px-6 py-4 flex flex-col justify-center shadow-sm">
        <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-1">
            <Link href="/admin/products" className="w-12 h-12 border-2 border-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-900 hover:border-slate-300 hover:text-slate-600 transition-all shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-1">Product Title</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Premium Acrylic Wall Art" 
                className="w-full max-w-3xl bg-transparent border-none outline-none text-2xl md:text-3xl font-black text-slate-900 placeholder:text-slate-200 p-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button 
              type="button"
              onClick={handleDeleteProduct}
              className="px-4 py-3 text-[#ff3f6c] hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2"
              title="Permanently remove this product"
            >
              <Trash2 size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Delete Product</span>
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <button 
              disabled={true}
              title="Asset Status changes are currently disabled"
              className="px-5 py-3 bg-slate-50 border-2 border-slate-100 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-2xl cursor-not-allowed flex items-center gap-2 opacity-60"
            >
              <span className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
              {status}
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} SAVE
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-6 py-6 font-inter">
         <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* COMPACT LEFT: Identity & Narrative */}
            <div className="col-span-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <Card title="Architecture" subTitle="Classification & Policy">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Core Identity</h4>
                        <button onClick={handleAddBrand} className="text-[9px] font-black text-[#ff3f6c] uppercase tracking-widest hover:underline">+ New Brand</button>
                     </div>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-900 uppercase ml-1">Type</label>
                              <select value={productType} onChange={e => setProductType(e.target.value as ProductType)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-black text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-all shadow-sm cursor-pointer">
                                 <option value="SIMPLE">SIMPLE PRODUCT</option>
                                 <option value="VARIABLE">VARIABLE PRODUCT</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-900 uppercase ml-1">Brand (Optional)</label>
                              <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-black text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-all shadow-sm cursor-pointer">
                                 <option value="">CHOOSE BRAND</option>
                                 {allBrands.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-900 uppercase ml-1">Department (Category) <span className="text-[#ff3f6c]">*</span></label>
                           <select 
                              value={selectedCategories[0]} 
                              onChange={e => setSelectedCategories([e.target.value])} 
                              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[12px] font-black text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-all shadow-sm cursor-pointer"
                           >
                              <option value="">SELECT DEPARTMENT</option>
                              {allCategories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                           </select>
                        </div>
                     </div>

                     <div
                        onClick={() => setIsReadyToSale(!isReadyToSale)}
                        className={`mt-6 flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isReadyToSale 
                            ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                            : 'bg-slate-50 border-slate-300 hover:border-slate-300'
                        }`}
                     >
                        <div>
                           <p className={`text-[12px] font-black uppercase tracking-tight ${isReadyToSale ? 'text-emerald-700' : 'text-slate-900/60'}`}>
                              Ready to sale
                           </p>
                           <p className="text-[10px] text-slate-900 font-medium mt-0.5">
                              {isReadyToSale ? 'Ready for sale without any customization needed' : 'Customizable (Not ready to sale)'}
                           </p>
                        </div>
                        <div className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${isReadyToSale ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isReadyToSale ? 'left-5' : 'left-0.5'}`} />
                        </div>
                     </div>
                  </Card>

                  <Card title="Finance" subTitle="MRP vs Store">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-900">₹</span>
                           <input type="number" value={pricing.regularPrice} onChange={e => setPricing({...pricing, regularPrice: e.target.value})} className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-[14px] font-medium text-slate-950 outline-none focus:border-slate-950 transition-all shadow-sm font-inter" placeholder="0" />
                        </div>
                        <div className="relative">
                           <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-pink-300">₹</span>
                           <input type="number" value={pricing.salePrice} onChange={e => setPricing({...pricing, salePrice: e.target.value})} className="w-full pl-8 pr-3 py-2.5 bg-pink-50/10 border border-slate-300 rounded-xl text-[14px] font-medium text-[#ff3f6c] outline-none focus:border-[#ff3f6c] transition-all shadow-sm font-inter" placeholder="0" />
                        </div>
                     </div>
                  </Card>
               </div>

               <Card title="Product Content" subTitle="Marketing Summary & Narrative">
                  <div className="space-y-4">
                     <div className="px-1">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Product Summary</h4>
                        <input 
                           value={shortDescription} 
                           onChange={e => setShortDescription(e.target.value)} 
                           placeholder="Catchy one-liner for search and list..." 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-medium outline-none focus:border-slate-300 focus:bg-white transition-all font-inter" 
                        />
                     </div>
                     <div className="px-1 pt-2">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Full Description <span className="text-[#ff3f6c]">*</span></h4>
                        <textarea 
                           value={description} 
                           onChange={e => setDescription(e.target.value)} 
                           rows={6} 
                           placeholder="Enter full product details and specifications..." 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-600 leading-relaxed outline-none focus:border-slate-300 focus:bg-white transition-all shadow-inner font-inter" 
                        />
                     </div>
                  </div>
               </Card>

               <Card title="Inventory & Content">
                   <div className={`grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-100 ${
                     !allCategories.find(c => c.id === selectedCategories[0])?.name?.toLowerCase().includes('album') 
                       ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none' 
                       : ''
                   }`}>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Min Photos (For Album)</label>
                         <input 
                           type="number" 
                           value={minPhotos} 
                           onChange={e => setMinPhotos(parseInt(e.target.value)||0)} 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-inter" 
                           disabled={!allCategories.find(c => c.id === selectedCategories[0])?.name?.toLowerCase().includes('album')}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Max Photos (For Album)</label>
                         <input 
                           type="number" 
                           value={maxPhotos} 
                           onChange={e => setMaxPhotos(parseInt(e.target.value)||0)} 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-inter" 
                           disabled={!allCategories.find(c => c.id === selectedCategories[0])?.name?.toLowerCase().includes('album')}
                         />
                      </div>
                   </div>
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-1 font-inter">Stock Status</p>
                        <select value={inventory.stockStatus} onChange={e => setInventory({...inventory, stockStatus: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium outline-none">
                           <option value="IN_STOCK">✅ INSTOCK</option>
                           <option value="OUT_OF_STOCK">❌ NO STOCK</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-1 font-inter">Quantity <span className="text-[#ff3f6c]">*</span></p>
                        <input type="number" value={inventory.stockQuantity} onChange={e => setInventory({...inventory, stockQuantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-black text-center outline-none font-inter" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest pl-1 font-inter">Base SKU <span className="text-[#ff3f6c]">*</span></p>
                        <input value={inventory.sku} onChange={e => setInventory({...inventory, sku: e.target.value})} placeholder="SKU001" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black uppercase text-center outline-none font-inter" />
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full transition-all relative ${isSoldIndividually ? 'bg-blue-600' : 'bg-slate-200'}`}>
                           <input type="checkbox" checked={isSoldIndividually} onChange={e => setIsSoldIndividually(e.target.checked)} className="hidden" />
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isSoldIndividually ? 'left-5' : 'left-1 shadow-sm'}`} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest leading-none">Sold Individually</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Limit to 1 item per checkout session</p>
                        </div>
                     </label>
                  </div>
               </Card>
            </div>

            {/* COMPACT RIGHT: Visuals & Tags */}
            <div className="col-span-4 space-y-6">
               <Card title="Visuals & Shipping">
                  <div className="grid grid-cols-1 gap-6">
                     <label className="block aspect-[4/3] bg-slate-50 rounded-[2rem] overflow-hidden cursor-pointer relative shadow-inner group">
                        {mainImage ? (
                           <img src={getImageUrl(mainImage)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                               <ImageIcon size={32} strokeWidth={1} />
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Primary Asset</span>
                           </div>
                        )}
                        <input type="file" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if(!f) return; const fd = new FormData(); fd.append("image", f); const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd }); const data = await res.json(); if(data.url) setMainImage(data.url); }} />
                     </label>
                     
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                           {gallery.map((img, i) => (
                              <div key={i} className="relative group aspect-square">
                                  {getImageUrl(img) && <img src={getImageUrl(img)} className="w-full h-full object-cover rounded-2xl" />}

                                 <button onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"><X size={12} /></button>
                              </div>
                           ))}
                           {gallery.length < 12 && (
                              <label className="aspect-square bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-900/60 hover:border-slate-400 cursor-pointer transition-all">
                                 <Plus size={20} />
                                 <input type="file" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if(!f) return; const fd = new FormData(); fd.append("image", f); const res = await fetch(`${API_URL}/upload`, { method: "POST", body: fd }); const data = await res.json(); if(data.url) setGallery([...gallery, data.url]); }} />
                              </label>
                           )}
                        </div>

                        <div className="space-y-4 pt-2">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest ml-1">Weight (KG) <span className="text-[#ff3f6c]">*</span></label>
                              <input type="number" value={shipping.weight} onChange={e => setShipping({...shipping, weight: e.target.value})} placeholder="e.g. 0.5" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-black outline-none focus:border-slate-950 transition-all font-inter" />
                           </div>
                           <div className="grid grid-cols-3 gap-3">
                              {['length', 'width', 'height'].map(f => (
                                 <div key={f} className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest ml-1">{f === 'length' ? 'Length' : f === 'width' ? 'Width' : 'Height'} (CM)</label>
                                    <input type="number" value={(shipping as any)[f]} onChange={e => setShipping({...shipping, [f]: e.target.value})} placeholder="0" className="w-full py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-center outline-none focus:border-slate-950 transition-all font-inter" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>

               <div className="bg-blue-50 rounded-[40px] p-8 space-y-5 shadow-sm border border-blue-100">
                  <div className="px-1 text-center">
                     <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-[0.3em] mb-1">Layout Tags <span className="text-[#ff3f6c]">*</span></h4>
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">For Homepage Discoverability</p>
                  </div>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="BEST SELLERS, POPULAR, NEW" className="w-full py-4 bg-white border border-blue-200 rounded-3xl font-black text-[12px] text-center text-blue-900 outline-none placeholder:text-blue-200 focus:border-blue-500 transition-all shadow-inner uppercase tracking-widest font-inter" />
               </div>
            </div>

            {/* FULL WIDTH: Variation Master */}
            {productType === "VARIABLE" && (
               <div className="col-span-12 mt-6">
                  <div className="bg-white rounded-[48px] border border-slate-300/60 shadow-2xl overflow-hidden mb-10">
                     <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl rotate-3"><Layers size={28} /></div>
                           <div>
                              <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-none mb-1">Variation Master</h2>
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Controlling {variations.length} unique combinations</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setAttributes([...attributes, { name: "", values: [], visible: true, usedForVariations: true }])} className="px-8 py-3.5 bg-white border-2 border-slate-100 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Append Attr</button>
                           <button onClick={generateVariations} className="px-12 py-3.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">GENERATE VARIANCES</button>
                        </div>
                     </div>

                     <div className="p-10 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {categoryAttributes.map((attr, idx) => (
                              <div key={`cat-${idx}`} className="bg-white p-6 rounded-3xl border border-slate-300 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                 <div><p className="text-[10px] font-black text-indigo-600 uppercase mb-1 leading-none tracking-widest">Asset Class</p><h5 className="text-[16px] font-black text-slate-950 tracking-tight">{attr.name}</h5><p className="text-[11px] font-medium text-slate-900/60 mt-1">{(attr.values || []).join(' | ')}</p></div>
                                 <input type="checkbox" checked={attr.usedForVariations} onChange={e => { const u = [...categoryAttributes]; u[idx].usedForVariations = e.target.checked; setCategoryAttributes(u); }} className="w-6 h-6 rounded-lg text-indigo-600 border-slate-300 transition-all cursor-pointer" />
                              </div>
                           ))}
                           {attributes.map((attr, i) => (
                              <div key={`custom-${i}`} className="bg-white p-6 rounded-3xl border border-slate-300 space-y-4 shadow-md relative group hover:border-[#ff3f6c] transition-all">
                                 <div className="flex justify-between items-start">
                                    <input value={attr.name} onChange={e => { const u = [...attributes]; u[i].name = e.target.value; setAttributes(u); }} placeholder="NAME: e.g. Color" className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-black text-sm text-slate-950 focus:border-slate-950 transition-all outline-none mr-2" />
                                    <div className="flex items-center gap-2">
                                       <input type="checkbox" checked={attr.usedForVariations} onChange={e => { const u = [...attributes]; u[i].usedForVariations = e.target.checked; setAttributes(u); }} className="w-5 h-5 rounded-md text-indigo-600 border-slate-300 transition-all cursor-pointer" />
                                       <button onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={20} /></button>
                                    </div>
                                 </div>
                                 <input value={(attr.values || []).join(' | ')} onChange={e => { const u = [...attributes]; u[i].values = e.target.value.split('|').map(v => v.trim()); setAttributes(u); }} placeholder="VALUES: Black | White | Red" className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 font-black text-[11px] text-[#ff3f6c] uppercase tracking-[0.2em] outline-none" />
                              </div>
                           ))}
                        </div>

                        {variations.length > 0 && (
                           <div className="border border-slate-100 rounded-[48px] overflow-hidden bg-white shadow-2xl">
                              <div className="overflow-x-auto no-scrollbar">
                                 <div className="min-w-[1400px]">
                                    <div className="bg-blue-600 px-10 py-6 grid grid-cols-12 gap-6 items-center">
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Identity</div>
                                       <div className="col-span-2 text-[11px] font-black text-blue-100 uppercase tracking-widest">Attribute Map</div>
                                       <div className="col-span-5 text-[11px] font-black text-blue-100 uppercase tracking-widest">Inventory SKU</div>
                                       <div className="col-span-2 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Retail Price (₹)</div>
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-center">Stock</div>
                                       <div className="col-span-1 text-[11px] font-black text-blue-100 uppercase tracking-widest text-right">Action</div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                       {variations.map((v, i) => (
                                          <div key={`var-${i}`} className={`px-10 py-6 grid grid-cols-12 gap-6 items-center ${expandedVar === i ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                             <div className="col-span-1 flex justify-center">
                                                <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-1">
                                                   {getImageUrl(v.image || mainImage) && <img src={getImageUrl(v.image || mainImage)} className="w-full h-full object-cover rounded-xl" />}
                                                </div>
                                             </div>
                                             <div className="col-span-2 flex flex-wrap gap-1">
                                                {Object.entries(v.attributes).map(([k, val]) => (
                                                   <div key={k} className="flex flex-col"><span className="text-[8px] font-black text-slate-900 uppercase leading-none mb-0.5">{k}</span><span className="px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase">{val}</span></div>
                                                ))}
                                             </div>
                                             <div className="col-span-5"><input value={v.sku} onChange={e => { const u = [...variations]; u[i].sku = e.target.value; setVariations(u); }} className="w-full h-12 px-5 bg-white border border-slate-300 rounded-2xl font-black text-[12px] uppercase shadow-sm" /></div>
                                             <div className="col-span-2 relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-900">₹</span><input value={v.price} onChange={e => { const u = [...variations]; u[i].price = e.target.value; setVariations(u); }} className="w-full h-12 pl-8 pr-4 bg-white border border-slate-300 rounded-2xl font-black text-lg text-slate-950 shadow-sm" /></div>
                                             <div className="col-span-1"><input value={v.stock} onChange={e => { const u = [...variations]; u[i].stock = e.target.value; setVariations(u); }} className="w-full h-12 bg-white border border-slate-300 rounded-2xl text-lg font-black text-slate-950 text-center shadow-sm" /></div>
                                             <div className="col-span-1 flex justify-end gap-2 text-slate-900">
                                                <button onClick={() => setExpandedVar(expandedVar === i ? null : i)} className="w-10 h-10 bg-white border border-slate-300 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Settings size={18} /></button>
                                                <button onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="w-10 h-10 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                                             </div>
                                             {expandedVar === i && (
                                                <div className="col-span-12 p-10 bg-slate-50/80 rounded-[3rem] border border-slate-100 mt-6 grid grid-cols-5 gap-8 animate-in fade-in zoom-in-95 duration-300">
                                                   <div className="space-y-3"><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2">Sale Price (₹)</p><input value={v.salePrice} onChange={e => { const u = [...variations]; u[i].salePrice = e.target.value; setVariations(u); }} className="w-full h-14 px-6 bg-white border-2 border-white rounded-[2rem] font-black text-rose-600 outline-none shadow-sm focus:border-rose-100 text-lg" /></div>
                                                   {['weight', 'length', 'width', 'height'].map(f => <div key={f} className="space-y-3"><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-2">{f.toUpperCase()} (KG/CM)</p><input value={(v as any)[f] || ""} onChange={e => { const u = [...variations]; u[i][f as keyof Variation] = e.target.value as any; setVariations(u); }} className="w-full h-14 px-6 bg-white border-2 border-white rounded-[2rem] font-black text-slate-950 text-center outline-none shadow-sm focus:border-indigo-100 text-lg" /></div>)}
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
    </div>
  );
}
