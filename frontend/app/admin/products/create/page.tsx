"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Save, Package, ChevronLeft, Loader2, 
  Grid3X3, Layers, Image as ImageIcon, Trash2, Layout,
  Truck, ArrowUpRight, Minus, X, CheckSquare, Settings, 
  Eye, ShoppingBag, Star, Zap, Filter, Images, LayoutGrid, AlertCircle
} from "lucide-react";
import MediaPicker from "@/components/MediaPicker";

// Types
type ProductType = "SIMPLE" | "VARIABLE";
type ProductStatus = "DRAFT" | "TESTING" | "PUBLISHED" | "PRIVATE";

interface Variation {
  id?: string;
  price: string;
  salePrice: string;
  sku: string;
  stock: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "ON_BACKORDER";
  manageStock: boolean;
  image: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  isVirtual: boolean;
  isDownloadable: boolean;
  attributes: Record<string, string>;
}

interface AttributeValue {
  value: string;
  displayValue?: string;
  image?: string;
}

interface Attribute {
  name: string;
  type?: "SELECT" | "SWATCH";
  values: string[];
  enrichedValues?: AttributeValue[];
  visible: boolean;
  usedForVariations: boolean;
}

export default function CreateProductPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  };

  // States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [productType, setProductType] = useState<ProductType>("SIMPLE");
  const [status, setStatus] = useState<ProductStatus>("DRAFT");
  
  // WooCommerce Features (Mandatory basic fields)
  const [isVirtual, setIsVirtual] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [isReadyToSale, setIsReadyToSale] = useState(false);
  const [isSoldIndividually, setIsSoldIndividually] = useState(false);
  const [purchaseNote, setPurchaseNote] = useState("");
  const [enableReviews, setEnableReviews] = useState(true);
  const [menuOrder, setMenuOrder] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [upsellIds, setUpsellIds] = useState("");
  const [crossSellIds, setCrossSellIds] = useState("");

  // Images
  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [minPhotos, setMinPhotos] = useState<number>(0);
  const [maxPhotos, setMaxPhotos] = useState<number>(0);
  
  // Media Picker state
  type PickerTarget = "main" | "gallery" | null;
  const [pickerOpen, setPickerOpen] = useState<PickerTarget>(null);

  // Categories & Brands
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [tags, setTags] = useState("");
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);


  // Section Data
  const [pricing, setPricing] = useState({ regularPrice: "", salePrice: "" });
  const [inventory, setInventory] = useState({
    sku: "",
    trackInventory: true,
    stockQuantity: 0,
    stockStatus: "IN_STOCK"
  });
  const [shipping, setShipping] = useState({
    weight: "",
    length: "",
    width: "",
    height: ""
  });

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const calculateDiscount = () => {
    const reg = parseFloat(pricing.regularPrice);
    const sale = parseFloat(pricing.salePrice);
    if (reg && sale && sale < reg) return Math.round(((reg - sale) / reg) * 100);
    return 0;
  };

  useEffect(() => {
    if (!API_URL) return;
    Promise.all([
      fetch(`${API_URL}/categories`).then(res => res.json()),
      fetch(`${API_URL}/brands`).then(res => res.json())
    ]).then(([cats, brands]) => {
      setAllCategories(Array.isArray(cats) ? cats : []);
      setAllBrands(Array.isArray(brands) ? brands : []);
      setFetching(false);
    }).catch(err => {
      console.error(err);
      setFetching(false);
    });
  }, [API_URL]);

  useEffect(() => {
    const catId = selectedCategories[0];
    if (!catId || !API_URL) return;
    fetch(`${API_URL}/categories/${catId}`)
      .then(res => res.json())
      .then(data => {
        if (data.categoryAttributes) {
           const inherited = data.categoryAttributes.map((ca: any) => ({
              name: ca.name,
              type: ca.type,
              values: ca.attributeOptions?.map((o: any) => o.value) || [],
              usedForVariations: true
           }));
           setCategoryAttributes(inherited);
        }
      });
  }, [selectedCategories, API_URL]);
  
  // Auto-generate variations when attributes change
  useEffect(() => {
    if (productType === 'VARIABLE' && (categoryAttributes.length > 0 || attributes.length > 0)) {
        generateVariations(false);
    }
  }, [categoryAttributes, attributes, productType]);

  const generateVariations = (isManual = true) => {
    const activeAttrs = [
      ...categoryAttributes.filter(a => a.usedForVariations && a.values.some((v: string) => v.trim() !== "")),
      ...attributes.filter(a => a.usedForVariations && a.values.some((v: string) => v.trim() !== ""))
    ];
    if (activeAttrs.length === 0) {
      if (isManual && categoryAttributes.length === 0) {
        alert("Select at least one attribute for variations!");
      }
      return;
    }

    const combinations = activeAttrs.reduce((acc, attr) => {
      const field = attr.name;
      const values = attr.values.filter((v: string) => v.trim() !== "");
      if (acc.length === 0) return values.map((v: any) => ({ [field]: v }));
      return acc.flatMap((combo: any) => values.map((v: any) => ({ ...combo, [field]: v })));
    }, [] as any[]);

    setVariations(combinations.map((combo: any) => {
      const comboPath = Object.values(combo).join('-').toUpperCase();
      const generatedSku = inventory.sku ? `${inventory.sku}-${comboPath}` : comboPath;
      return {
        price: pricing.regularPrice,
        salePrice: pricing.salePrice,
        sku: generatedSku,
        stock: inventory.stockQuantity.toString(),
        stockStatus: "IN_STOCK",
        manageStock: true,
        image: mainImage,
        weight: shipping.weight,
        length: shipping.length,
        width: shipping.width,
        height: shipping.height,
        isVirtual: isVirtual,
        isDownloadable: isDownloadable,
        attributes: combo
      };
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    // GLOBAL MANDATORY VALIDATION (Matching Edit Page)
    if (!name.trim()) { setError("Product Title is mandatory"); setLoading(false); return; }
    if (!description.trim()) { setError("Product Narrative (Description) is mandatory"); setLoading(false); return; }
    if (!selectedCategories[0]) { setError("Department selection is mandatory"); setLoading(false); return; }
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
       const invalidVar = variations.find((v: any) => !v.price || parseFloat(v.price) <= 0 || !v.stock || parseInt(v.stock?.toString()) <= 0);
       if (invalidVar) {
         setError("All variations must have a price and a stock count greater than zero"); setLoading(false); return;
       }
    }

    const payload = {
      name, slug, description, shortDescription, productType, status,
      mainImage, images: JSON.stringify(gallery),
      categoryId: selectedCategories[0],
      brandId: selectedBrand || null,
      regularPrice: pricing.regularPrice,
      salePrice: pricing.salePrice,
      sku: inventory.sku,
      trackInventory: inventory.trackInventory,
      stockQuantity: inventory.stockQuantity.toString(),
      stockStatus: inventory.stockStatus,
      ...shipping,
      tags,
      isVirtual, isDownloadable, isReadyToSale, isSoldIndividually,
      purchaseNote, enableReviews, menuOrder,
      externalUrl, buttonText,
      upsellIds, crossSellIds,
      minPhotos, maxPhotos,
      productAttributes: attributes.map(a => ({
        name: a.name,
        type: a.type || "SELECT",
        options: a.values.map(v => ({ value: v }))
      })),
      variants: variations.map((v: any) => ({
        ...v,
        price: parseFloat(v.price) || 0,
        salePrice: parseFloat(v.salePrice) || null,
        stock: parseInt(v.stock) || 0,
        attributes: Object.entries(v.attributes).map(([name, value]: [string, any]) => ({ name, value }))
      }))
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.code 
          ? `DB<${data.code}>: ${data.description || data.error || 'Sync Failure'}`
          : (data.error || "Failed to publish product.");
        setError(msg);
        setLoading(false);
        return;
      }

      setSuccess("Product successfully listed!");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) { 
      console.error("Save Crash Details:", err);
      setError(err.message || "An unexpected error occurred."); 
    }
    finally { setLoading(false); }
  };

  if (fetching) return (
     <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
     </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#282c3f] pb-20 font-inter">
      <header className="sticky top-0 z-50 bg-white/80 border-b border-slate-300/60 px-8 py-5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-slate-900 hover:text-slate-900 shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <label className="text-[11px]  text-slate-900 capitalize tracking-widest mb-1 pl-1">Product Title</label>
                  <input 
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Premium Acrylic Wall Art" 
                    className="text-xl font-medium bg-transparent border-none outline-none placeholder:text-slate-200 w-[450px] border-b border-transparent focus:border-slate-300 transition-all pb-1" 
                  />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-300 h-fit mt-5">
                   <div className={`w-1.5 h-1.5 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                   <span className="text-[11px]  text-slate-900 capitalize tracking-widest">{status}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white  text-[11px] capitalize tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2.5 disabled:opacity-50">
             {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             Publish Item
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-8">
         {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-4">
               <AlertCircle size={20} />
               <p className="text-base  capitalize tracking-widest">{error}</p>
            </div>
         )}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-10">
               <Card icon={<Grid3X3 className="w-4 h-4 text-slate-900/60" />} title="Product Logistics" subTitle="Manage Core Architecture">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[12px] font-medium text-slate-900 capitalize tracking-widest pl-1">Architecture</label>
                        <select 
                           value={productType} onChange={e => setProductType(e.target.value as ProductType)}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-base"
                        >
                           <option value="SIMPLE">Standard - Single product unit</option>
                           <option value="VARIABLE">Variable - Multiple options</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[12px] font-medium text-slate-900 capitalize tracking-widest pl-1">Asset Status</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl h-[46px]">
                           <label className={`flex-1 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isVirtual ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-slate-900'}`}>
                              <input type="checkbox" checked={isVirtual} onChange={e => setIsVirtual(e.target.checked)} className="hidden" />
                              <span className="text-[12px] capitalize">Virtual</span>
                           </label>
                           <label className={`flex-1 flex items-center justify-center rounded-lg cursor-pointer transition-all ${isDownloadable ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-slate-900'}`}>
                              <input type="checkbox" checked={isDownloadable} onChange={e => setIsDownloadable(e.target.checked)} className="hidden" />
                              <span className="text-[12px] capitalize">Downloadable</span>
                           </label>
                        </div>
                     </div>
                  </div>

                  <div
                    onClick={() => setIsReadyToSale(!isReadyToSale)}
                    className={`mt-8 flex items-center justify-between px-6 py-5 rounded-3xl border-2 cursor-pointer transition-all ${
                      isReadyToSale 
                        ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-50 border-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div>
                        <p className={`text-[12px]  capitalize tracking-widest ${isReadyToSale ? 'text-emerald-700' : 'text-slate-950'}`}>
                          Ready to sale
                        </p>
                        <p className="text-[12px] text-slate-950  capitalize tracking-widest mt-1 opacity-70">
                          {isReadyToSale ? 'Ready for sale without any customization needed' : 'Customizable (Not ready to sale)'}
                        </p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${isReadyToSale ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${isReadyToSale ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
               </Card>

                <Card icon={<Zap className="w-4 h-4 text-amber-500" />} 
                   title={<div className="flex items-center gap-3">Price Matrix {productType === 'VARIABLE' && <span className="text-[12px] bg-slate-100 text-slate-900 px-2 py-0.5 rounded-full  border border-slate-300">INACTIVE</span>}</div>} 
                   subTitle={productType === 'VARIABLE' ? "Pricing is handled in 'Variation Matrix' below" : "Global Storefront Values"}
                   className={productType === 'VARIABLE' ? 'opacity-40 grayscale pointer-events-none transition-all duration-500 scale-[0.98]' : 'transition-all duration-500'}
                >
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest ml-1">List Price (MRP)</label>
                        <div className="relative group">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl  text-slate-300">₹</span>
                           <input type="number" value={pricing.regularPrice} onChange={e => setPricing({...pricing, regularPrice: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-[#f8f9fb] rounded-2xl text-xl  text-slate-800 outline-none focus:bg-white transition-all" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center pl-1">
                           <label className="text-[12px]  text-blue-600 capitalize tracking-widest">Sale Price</label>
                           {calculateDiscount() > 0 && <span className="bg-blue-50 text-blue-600 text-[11px]  px-2 py-0.5 rounded-full border border-blue-100">{calculateDiscount()}% OFF</span>}
                        </div>
                        <div className="relative group">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl  text-blue-600/30">₹</span>
                           <input type="number" value={pricing.salePrice} onChange={e => setPricing({...pricing, salePrice: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-blue-50/10 rounded-2xl text-xl  text-blue-600 outline-none focus:bg-white transition-all" />
                        </div>
                     </div>
                  </div>
               </Card>

               <Card icon={<Package className="w-4 h-4 text-blue-500" />} title="Inventory Engine" subTitle="Sync with warehouse stats">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">SKU Identity</label>
                        <input value={inventory.sku} onChange={e => setInventory({...inventory, sku: e.target.value})} placeholder="e.g. AMOL-001" className="w-full px-5 py-3.5 bg-[#f8f9fb] rounded-xl font-medium text-base outline-none focus:bg-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Stock Status</label>
                        <select value={inventory.stockStatus} onChange={e => setInventory({...inventory, stockStatus: e.target.value})} className="w-full px-5 py-3.5 bg-[#f8f9fb] rounded-xl font-medium text-base appearance-none">
                           <option value="IN_STOCK">IN STOCK</option>
                           <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                           <option value="ON_BACKORDER">BACKORDER</option>
                        </select>
                     </div>
                     <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <label className="flex items-center gap-3 cursor-pointer">
                           <input type="checkbox" checked={isSoldIndividually} onChange={e => setIsSoldIndividually(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                           <div>
                              <p className="text-[11px]  text-slate-900 capitalize tracking-widest leading-none">Sold Individually</p>
                              <p className="text-[11px] text-slate-900 font-medium capitalize tracking-widest">Limit to 1 item per checkout session</p>
                           </div>
                        </label>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
                           <button onClick={() => setInventory({...inventory, stockQuantity: Math.max(0, inventory.stockQuantity - 1)})}><Minus size={14} /></button>
                           <input type="number" value={inventory.stockQuantity} onChange={e => setInventory({...inventory, stockQuantity: parseInt(e.target.value)||0})} className="w-10 text-center text-base font-medium bg-transparent outline-none" />
                           <button onClick={() => setInventory({...inventory, stockQuantity: inventory.stockQuantity + 1})}><Plus size={14} className="text-blue-600" /></button>
                        </div>
                     </div>
                  </div>
               </Card>

               <Card icon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />} title="Advanced Configuration" subTitle="WooCommerce Extended Metadata">
                   <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">External URL</label>
                           <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} className="w-full px-4 py-3.5 bg-[#f8f9fb] rounded-xl font-medium text-base" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Button Copy</label>
                           <input value={buttonText} onChange={e => setButtonText(e.target.value)} className="w-full px-4 py-3.5 bg-[#f8f9fb] rounded-xl font-medium text-base" placeholder="Get it at..." />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Submission Note</label>
                        <textarea value={purchaseNote} onChange={e => setPurchaseNote(e.target.value)} rows={3} className="w-full px-4 py-3.5 bg-[#f8f9fb] rounded-xl font-medium text-base outline-none focus:bg-white" placeholder="Visible after checkout..." />
                     </div>
                     <div className="flex items-center gap-12 pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer">
                           <input type="checkbox" checked={enableReviews} onChange={e => setEnableReviews(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                           <span className="text-[11px]  text-slate-900 capitalize tracking-widest">Allow Customer Reviews</span>
                        </label>
                        <div className="flex-1 space-y-2">
                           <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Display Priority</label>
                           <input type="number" value={menuOrder} onChange={e => setMenuOrder(parseInt(e.target.value)||0)} className="w-full px-4 py-3 bg-[#f8f9fb] rounded-xl text-base font-medium" />
                        </div>
                     </div>
                   </div>
               </Card>

               <Card icon={<Layout className="w-4 h-4 text-orange-500" />} title="Product Description" subTitle="Marketing Summary & Narrative">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Product Summary</label>
                        <textarea 
                           value={shortDescription} onChange={e => setShortDescription(e.target.value)}
                           rows={3} 
                           placeholder="Short summary for shop catalog grid..."
                           className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl font-medium text-base text-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Full Description</label>
                        <textarea 
                           value={description} onChange={e => setDescription(e.target.value)}
                           rows={8} 
                           placeholder="Detailed product specifications and information..."
                           className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl font-medium text-base text-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
                        />
                     </div>
                  </div>
               </Card>

               {productType === "VARIABLE" && (
                  <Card icon={<Layers className="w-4 h-4 text-indigo-500" />} title="Virtual Variant Matrix" subTitle="Define options & combinations">
                     <div className="space-y-8">
                        <div className="p-6 bg-slate-50 border border-slate-300 rounded-3xl space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="text-[11px]  text-slate-900 capitalize tracking-widest">Active Attributes</h4>
                              <button onClick={() => setAttributes([...attributes, { name: "", values: [], visible: true, usedForVariations: true }])} className="text-[12px] font-medium text-blue-600 hover:text-blue-800 capitalize tracking-widest flex items-center gap-1"><Plus size={12} /> Add New Class</button>
                           </div>
                           <div className="space-y-4">
                              {categoryAttributes.map((attr, idx) => (
                                 <div key={`cat-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div>
                                       <p className="text-[12px]  text-blue-600 capitalize mb-1 tracking-widest pl-1">Inherited Class</p>
                                       <h5 className="text-[14px]  text-slate-900 leading-none">{attr.name}</h5>
                                       <p className="text-[12px] font-medium text-slate-400 mt-1 capitalize tracking-tighter">Variances: {attr.values.join(' | ')}</p>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                       <div className={`w-10 h-6 rounded-full transition-all relative ${attr.usedForVariations ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                          <input 
                                             type="checkbox" 
                                             checked={attr.usedForVariations} 
                                             onChange={e => {
                                                const u = [...categoryAttributes];
                                                u[idx].usedForVariations = e.target.checked;
                                                setCategoryAttributes(u);
                                             }} 
                                             className="hidden" 
                                          />
                                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${attr.usedForVariations ? 'left-5' : 'left-1'}`} />
                                       </div>
                                    </label>
                                 </div>
                              ))}
                              {attributes.map((attr, idx) => (
                                 <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-6">
                                    <input value={attr.name} onChange={e => { const u = [...attributes]; u[idx].name = e.target.value; setAttributes(u); }} placeholder="e.g. Size" className="w-40 px-4 py-2.5 bg-slate-50 border border-slate-300/60 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900 text-base" />
                                    <input value={attr.values.join(' | ')} onChange={e => { const u = [...attributes]; u[idx].values = e.target.value.split('|').map(v => v.trim()); setAttributes(u); }} placeholder="S | M | L" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300/60 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900 text-[11px] capitalize" />
                                    <button onClick={() => setAttributes(attributes.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                        <button onClick={() => generateVariations(true)} className="w-full py-4 bg-blue-600 text-white  text-[11px] capitalize tracking-widest rounded-2xl hover:bg-blue-700 transition-all">Regenerate Combined Matrix</button>
                        {variations.length > 0 && (
                           <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-sm">
                              <div className="overflow-x-auto no-scrollbar">
                                 <div className="min-w-[1000px]">
                                    <div className="bg-blue-600 px-8 py-4 grid grid-cols-12 gap-4 items-center">
                                       <div className="col-span-1 text-[12px]  text-blue-100 capitalize tracking-widest text-center">Identity</div>
                                       <div className="col-span-2 text-[12px]  text-blue-100 capitalize tracking-widest">Attribute Map</div>
                                       <div className="col-span-5 text-[12px]  text-blue-100 capitalize tracking-widest">Inventory SKU</div>
                                       <div className="col-span-2 text-[12px]  text-blue-100 capitalize tracking-widest text-center">Price (₹)</div>
                                       <div className="col-span-1 text-[12px]  text-blue-100 capitalize tracking-widest text-center">Stock</div>
                                       <div className="col-span-1"></div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                       {variations.map((v, i) => (
                                          <div key={`var-${i}`} className="px-8 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                                             <div className="col-span-1 flex justify-center">
                                                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm p-0.5">
                                                   {getImageUrl(v.image || mainImage) && <img src={getImageUrl(v.image || mainImage)} className="w-full h-full object-cover rounded-lg" />}
                                                </div>
                                             </div>
                                             <div className="col-span-2 flex flex-wrap gap-1">
                                                {Object.entries(v.attributes).map(([k, val]: [string, any]) => (
                                                   <span key={k} className="px-2 py-1 bg-blue-600 text-white text-[11px]  rounded capitalize">{val}</span>
                                                ))}
                                             </div>
                                             <div className="col-span-5">
                                                <input value={v.sku} onChange={e => { const u = [...variations]; u[i].sku = e.target.value; setVariations(u); }} className="w-full h-10 px-4 bg-white border border-slate-300 rounded-xl font-medium text-[11px] capitalize shadow-sm outline-none focus:border-blue-500" />
                                             </div>
                                             <div className="col-span-2 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]  text-slate-900">₹</span>
                                                <input value={v.price} onChange={e => { const u = [...variations]; u[i].price = e.target.value; setVariations(u); }} className="w-full h-10 pl-6 pr-3 bg-white border border-slate-300 rounded-xl  text-[13px] text-slate-950 text-right shadow-sm outline-none focus:border-blue-500" />
                                             </div>
                                             <div className="col-span-1">
                                                <input value={v.stock} onChange={e => { const u = [...variations]; u[i].stock = e.target.value; setVariations(u); }} className="w-full h-10 bg-white border border-slate-300 rounded-xl text-[13px]  text-slate-950 text-center shadow-sm outline-none focus:border-blue-500" />
                                             </div>
                                             <div className="col-span-1 flex justify-end">
                                                <button onClick={() => setVariations(variations.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={16} /></button>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </Card>
               )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-10">
               <Card title="Product Media" icon={<Images className="w-4 h-4 text-violet-500" />} subTitle="Main image & gallery">
                  {/* Main Image */}
                  <div className="space-y-3">
                     <label className="text-[12px]  text-slate-900 capitalize tracking-widest pl-1">Featured Image</label>
                     <div
                        className="relative aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden group cursor-pointer hover:border-blue-600/40 transition-all"
                        onClick={() => setPickerOpen("main")}
                     >
                        {mainImage ? (
                           <img src={getImageUrl(mainImage)} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                              <ImageIcon size={28} />
                              <p className="text-[12px]  capitalize tracking-widest text-blue-600">Open Media Library</p>
                           </div>
                        )}
                        {mainImage && (
                           <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[12px]  capitalize tracking-widest">Change Image</span>
                           </div>
                        )}
                     </div>
                     {mainImage && (
                        <button onClick={() => setMainImage("")} className="text-[11px]  text-red-400 hover:text-red-600 capitalize tracking-widest flex items-center gap-1">
                           <X size={10} /> Remove
                        </button>
                     )}
                  </div>

                  {/* Gallery */}
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                     <div className="flex items-center justify-between pl-1">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Gallery ({gallery.length}/8)</label>
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => setPickerOpen("gallery")}
                              className="text-[11px]  text-blue-600 hover:text-blue-700 capitalize tracking-widest flex items-center gap-1"
                           >
                              <Plus size={10} /> Add Images
                           </button>
                           <span className="text-slate-200">|</span>
                           <button
                              onClick={() => setPickerOpen("gallery")}
                              className="text-[11px]  text-blue-500 hover:text-blue-700 capitalize tracking-widest"
                           >
                              View All
                           </button>
                        </div>
                     </div>
                     {gallery.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                           {gallery.map((img, i) => (
                              <div key={i} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group border border-slate-100/50 shadow-sm transition-all hover:shadow-lg">
                                  {getImageUrl(img) && <img src={getImageUrl(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}

                                 <button 
                                    onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-900 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100"
                                 >
                                    <X size={10} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div
                           onClick={() => setPickerOpen("gallery")}
                           className="h-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-600/40 hover:bg-blue-600/5 transition-all"
                        >
                           <p className="text-[11px]  capitalize tracking-widest text-slate-300">+ Add gallery images</p>
                        </div>
                     )}
                  </div>
               </Card>

               <div className="bg-white rounded-3xl p-10 border border-slate-300 space-y-8 shadow-sm">
                  <div className="space-y-4">
                     <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Department</label>
                     <select 
                        value={selectedCategories[0]} onChange={e => setSelectedCategories([e.target.value])}
                        className={`w-full p-4 bg-slate-50 border rounded-2xl font-medium text-base ${!selectedCategories[0] ? 'border-orange-200' : 'border-slate-100'}`}
                     >
                        <option value="">Choose Category</option>
                        {allCategories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                     </select>
                     {!selectedCategories[0] && <p className="text-[11px] font-medium text-orange-500 capitalize tracking-widest px-1">Category is required</p>}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <div className="flex items-center justify-between px-1">
                        <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Identity Brand</label>
                        <Link href="/admin/brands" className="text-[12px]  text-blue-600 hover:text-blue-700 transition-all capitalize tracking-widest flex items-center gap-1.5"><Plus size={12} /> Add Brand</Link>
                     </div>
                     <select 
                        value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-base"
                     >
                        <option value="">Choose Brand</option>
                        {allBrands.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Layout Tags</label>
                     <input 
                        value={tags} 
                        onChange={e => setTags(e.target.value)}
                        placeholder="Wall Decoratives, Popular, etc."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-base"
                     />
                     <p className="text-[11px] text-slate-900 font-medium capitalize tracking-widest px-1">Comma separated tags for homepage sections</p>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* Media Picker Modal */}
      {pickerOpen && (
         <MediaPicker
           onClose={() => setPickerOpen(null)}
           multiple={pickerOpen === "gallery"}
           onSelect={(url) => {
             setMainImage(url);
             setPickerOpen(null);
           }}
           onSelectMultiple={(urls) => {
             setGallery(prev => [...prev, ...urls].slice(0, 8));
             setPickerOpen(null);
           }}
         />
      )}
    </div>
  );
}

function Card({ icon, title, subTitle, children, className }: any) {
   return (
      <div className={`bg-white rounded-[32px] p-8 border border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 ${className}`}>
         <div className="flex items-center gap-4">
            {icon && <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900 group-hover:text-blue-600 transition-colors shadow-inner border border-slate-100">{icon}</div>}
            <div className="flex-1">
               <h3 className="text-[13px]  text-slate-900 capitalize tracking-widest leading-none">{title}</h3>
               {subTitle && <p className="text-[11px] text-slate-900  capitalize tracking-widest mt-1.5 opacity-80">{subTitle}</p>}
            </div>
         </div>
         <div className="pt-2">
            {children}
         </div>
      </div>
   );
}
