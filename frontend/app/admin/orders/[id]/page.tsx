"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ChevronLeft,
  ChevronRight,
  MapPin, 
  Mail, 
  Phone, 
  Package, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Calendar,
  ExternalLink,
  Tag,
  Download,
  Users,
  Zap,
  Printer,
  FileJson,
  Code,
  Eye
} from "lucide-react";

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    mainImage: string;
    sku: string;
  };
  design: {
    previewImage: string;
    designJson: string;
  };
  selectedVariantOptions: string;
};

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingUrl: string;
  courierName: string;
  createdAt: string;
  items: OrderItem[];
};

const resolveMedia = (url: string | null, apiUrl?: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = apiUrl?.replace("/api", "") || "";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${base}${cleanUrl}`;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOrderDetail();
  }, [id, API_URL]);

  const fetchOrderDetail = async () => {
    if (!API_URL || !id) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`);
      const data = await res.json();
      
      if (!data || data.error) {
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error("Failed to fetch order", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (field: string, value: string) => {
    if (!API_URL || !id) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        await fetchOrderDetail();
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching records...</p>
      </div>
    );
  }

  if (!order) return <div className="p-10 text-center text-slate-500 font-medium">Order records not found.</div>;

  return (
    <div className="p-8 space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700 print:p-0">
      
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2.5 hover:bg-white rounded-xl border border-slate-200 transition-all text-slate-400 hover:text-blue-600 bg-slate-50 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order #{String(order.id || "").slice(-6).toUpperCase()}</h1>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                order.paymentStatus === 'PAID' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                : 'bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 mt-1 uppercase tracking-wider text-[11px] opacity-70">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/admin/orders/${id}/invoice`)}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Official Invoice
          </button>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div className="relative">
            <select 
              value={order.orderStatus}
              onChange={(e) => handleUpdateStatus("orderStatus", e.target.value)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 appearance-none pr-10"
            >
              <option value="RECEIVED">Received</option>
              <option value="PROCESSING">Processing</option>
              <option value="PRINTING">Printing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronRight className="w-3 h-3 text-white absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Items Card - Minimal */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 text-slate-900">
                <Package className="w-4 h-4" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Snapshot items</h2>
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-60">{order.items.length} items total</span>
            </div>
            
            <div className="divide-y divide-slate-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-8 flex gap-8 group hover:bg-slate-50/50 transition-all">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <img src={resolveMedia(item.design?.previewImage || item.product.mainImage, API_URL)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.product.name}</h3>
                         <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-1 opacity-60">SKU: {item.product.sku || "N/A"}</p>
                       </div>
                       <span className="font-bold text-slate-900 text-lg">₹{item.price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                       {item.selectedVariantOptions && JSON.parse(item.selectedVariantOptions).map((opt: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-wide">
                             {opt.attributeName}: <span className="text-blue-600">{opt.attributeValue}</span>
                          </span>
                       ))}
                    </div>
                    
                    {/* Visual Photo Breakdown for Print Studio */}
                    {item.design?.designJson && (() => {
                      try {
                        const parsed = JSON.parse(item.design.designJson);
                        const photos = parsed.photos || {};
                        const photoKeys = Object.keys(photos);
                        if (photoKeys.length === 0) return null;

                        return (
                          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Canvas Photos ({photoKeys.length} slots)</h4>
                             <div className="flex flex-wrap gap-2">
                               {photoKeys.map((key) => {
                                 const p = photos[key];
                                 return (
                                   <div key={key} className="group relative w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm hover:border-blue-500 transition-all cursor-zoom-in" onClick={() => window.open(resolveMedia(p.url, API_URL), "_blank")}>
                                      <img 
                                        src={resolveMedia(p.url, API_URL)} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                        alt={`Slot ${key}`} 
                                      />
                                      <div className="absolute top-0 right-0 p-1 bg-blue-600 text-white text-[7px] font-black rounded-bl-lg shadow-md">#{Number(key) + 1}</div>
                                   </div>
                                 );
                               })}
                             </div>
                          </div>
                        );
                      } catch (e) { return null; }
                    })()}

                    <div className="flex justify-between pt-4 items-center">
                       <div className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">Qty: <span className="text-slate-900">{item.quantity}</span></div>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => {
                             const blob = new Blob([item.design?.designJson || "{}"], { type: "application/json" });
                             const url = URL.createObjectURL(blob);
                             const a = document.createElement("a");
                             a.href = url;
                             a.download = `design_${order.id.slice(-6)}_${idx + 1}.json`;
                             a.click();
                           }}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all border border-blue-100/50"
                           title="Download for Studio"
                         >
                           <FileJson size={12} /> Sync JSON
                         </button>
                         <button 
                           onClick={() => window.open(resolveMedia(item.design?.previewImage || item.product.mainImage, API_URL), "_blank")}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
                           title="Full Resolution Preview"
                         >
                           <Eye size={12} /> Visual
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
               <Tag className="w-4 h-4 text-blue-600" />
               <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Financial Breakdown</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  {[
                    { label: "Subtotal", val: order.subTotal, neg: false },
                    { label: "Discounts", val: order.discountAmount, neg: true },
                    { label: "Tax (GST 18%)", val: order.taxAmount, neg: false },
                    { label: "Shipping", val: order.shippingCost, neg: false },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-widest text-[10px] opacity-70">{row.label}</span>
                       <span className={`text-[15px] font-bold ${row.neg ? 'text-rose-500' : 'text-slate-900'}`}>
                         {row.neg ? '-' : ''}₹{row.val.toLocaleString()}
                       </span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                     <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">Total Payable</span>
                     <span className="font-bold text-slate-900 text-3xl tracking-tight">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
               </div>
               
               <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Payment Audit</span>
                    <CreditCard className="w-4 h-4 text-blue-600 opacity-80" />
                  </div>
                  <div className="space-y-5">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none opacity-60">Method</p>
                        <p className="text-sm font-black text-slate-900 leading-none">{order.paymentMethod || "Razorpay"}</p>
                     </div>
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none opacity-60">Gateway Status</p>
                        <div className="flex items-center gap-2 leading-none">
                           <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-amber-500"}`} />
                           <p className="text-sm font-bold text-slate-900 italic underline decoration-blue-200 decoration-2">{order.paymentStatus}</p>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          {/* Customer Profile */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
             <div>
               <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-600" /> Customer Information
               </h2>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                        <CheckCircle2 className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{order.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-bold text-slate-900">{order.phone}</p>
                     </div>
                  </div>
               </div>
             </div>

             <div className="pt-6 border-t border-slate-100">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Delivery destination</h2>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed capitalize">{order.address}</p>
                </div>
             </div>
          </div>

          {/* Shipping Logic */}
          <div className="bg-blue-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-blue-900/40">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-blue-400" />
                <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">Logistics Hub</h2>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Carrier</label>
                    <input 
                      placeholder="e.g. BlueDart"
                      defaultValue={order.courierName}
                      onBlur={(e) => handleUpdateStatus("courierName", e.target.value)}
                      className="w-full bg-blue-800/50 border-blue-700/50 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:bg-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tracking Link</label>
                    <input 
                      placeholder="https://..."
                      defaultValue={order.trackingUrl}
                      onBlur={(e) => handleUpdateStatus("trackingUrl", e.target.value)}
                      className="w-full bg-blue-800/50 border-blue-700/50 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:bg-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                 </div>
                 {order.trackingUrl && (
                   <a 
                    href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                   >
                     Track Live <ExternalLink className="w-3 h-3" />
                   </a>
                 )}
              </div>
          </div>

          {/* Timeline - Minimal */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
             <div className="flex items-center gap-3 mb-8">
               <Clock className="w-4 h-4 text-slate-400" />
               <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Life-cycle</h2>
             </div>
             <div className="space-y-6 relative ml-1">
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-100" />
                <TimelineItem date={new Date(order.createdAt).toLocaleDateString()} label="Ordered" active />
                <TimelineItem date="--" label="Processing" active={["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.orderStatus)} />
                <TimelineItem date="--" label="In Transit" active={["SHIPPED", "DELIVERED"].includes(order.orderStatus)} />
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function TimelineItem({ date, label, active = false }: { date: string, label: string, active?: boolean }) {
  return (
    <div className="flex gap-6 relative z-10">
      <div className={`w-3.5 h-3.5 rounded-full border-4 border-white ring-1 ${active ? 'bg-blue-600 ring-blue-100 shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'bg-slate-200 ring-slate-100'} flex-shrink-0 mt-1`} />
      <div className="flex flex-col gap-0.5">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-slate-900' : 'text-slate-300'}`}>{label}</p>
        <p className="text-[9px] font-semibold text-slate-400">{date !== "--" ? date : "Queue..."}</p>
      </div>
    </div>
  );
}
