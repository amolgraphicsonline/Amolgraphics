"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock
} from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  address: string;
  courierName?: string;
  trackingUrl?: string;
  createdAt: string;
  items: any[];
};

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id && API_URL) {
      fetch(`${API_URL}/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setOrder(data);
          } else {
            setOrder(null);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, API_URL]);

  const resolve = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-[#002366]">Securing Transaction...</p>
        </div>
     </div>
  );

  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      {/* Streamlined Header */}
      <div className="bg-[#002366] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-4">
           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest">Transaction Secure</span>
           </div>
           
           <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
              Order Confirmed.<br/>
              <span className="text-blue-400 italic text-2xl md:text-3xl">Thank You, {order.customerName.split(' ')[0]}.</span>
           </h1>
           
           <div className="flex items-center justify-center gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                 <p className="text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">ID</p>
                 <p className="text-xs font-black mono uppercase">#{order.id.slice(-8)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                 <p className="text-[8px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Paid</p>
                 <p className="text-xs font-black uppercase tracking-widest">₹{order.totalAmount.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20 space-y-6">
        {/* Compact Main Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-[#002366]/5 border border-slate-100 overflow-hidden">
           <div className="p-6 md:p-8 space-y-8">
              
              {/* Tightened Delivery Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002366] shrink-0">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#002366]">Shipping To</h3>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed mt-1 uppercase italic">{order.address}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3">
                       <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                          <Clock className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Expected Delivery</h3>
                          <p className="text-xs font-bold text-slate-500 mt-1 uppercase italic">5-7 Business Days</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Logistics Track</h4>
                       <Truck className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    
                    {order.trackingUrl ? (
                      <div className="space-y-3">
                         <div className="p-3 bg-white border border-slate-200 rounded-xl">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Partner</p>
                            <p className="text-xs font-black text-[#002366] uppercase">{order.courierName || "Standard Shipping"}</p>
                         </div>
                         <a 
                           href={order.trackingUrl}
                           className="flex items-center justify-center gap-2 w-full py-3 bg-[#002366] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-900/10"
                         >
                           Track Live <ExternalLink className="w-3 h-3" />
                         </a>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                         <p className="text-[9px] font-black text-[#002366] uppercase tracking-widest">Awaiting Dispatch</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Tracking updates shortly</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Bar */}
              <div className="pt-8 border-t border-slate-100 flex gap-3">
                 <Link 
                   href="/"
                   className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all group"
                 >
                   <ShoppingBag className="w-3.5 h-3.5" /> Home
                 </Link>
                 <button 
                   onClick={() => window.print()}
                   className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all group"
                 >
                   <Printer className="w-3.5 h-3.5" /> Receipt
                 </button>
              </div>

           </div>

           {/* Receipt Snapshot */}
           <div className="bg-slate-50/50 p-6 md:p-8 border-t border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#002366] mb-6">Snapshot summary</h3>
              <div className="space-y-4">
                 {order.items?.map((item, i) => {
                    const designData = JSON.parse(item.design?.designJson || '{}');
                    return (
                      <div key={i} className="flex items-center justify-between group bg-white p-3 rounded-xl border border-slate-100/50 shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex-shrink-0">
                               <img src={resolve(item.design?.previewImage || item.product?.image)} className="w-full h-full object-cover rounded-md" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-[#002366] uppercase tracking-tight truncate max-w-[120px]">
                                 {designData.designName || item.product?.name || "Premium Product"}
                               </p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">Qty: {item.quantity}</p>
                            </div>
                         </div>
                         <span className="text-xs font-black text-[#002366]">₹{item.price.toLocaleString()}</span>
                      </div>
                    );
                 })}
                 <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[#002366]">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Settled</span>
                    <span className="text-xl font-black tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Minimal Support Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50/30 rounded-2xl border border-blue-100/30 gap-4">
           <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-blue-600" />
              <p className="text-[9px] font-black text-[#002366] uppercase tracking-widest">Questions about this order?</p>
           </div>
           <Link 
             href="/contact"
             className="px-6 py-2.5 bg-white border border-blue-200 rounded-lg text-[9px] font-black text-[#002366] uppercase tracking-widest hover:bg-[#002366] hover:text-white transition-all shadow-sm"
           >
             Get Support
           </Link>
        </div>
      </div>
    </div>
  );
}
