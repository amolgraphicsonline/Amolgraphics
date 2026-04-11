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
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Header */}
      <div className="bg-[#002366] text-white pt-20 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
           <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Payment Verified & Secure</span>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
              Order Confirmed.<br/>
              <span className="text-blue-400 italic">Thank You, {order.customerName.split(' ')[0]}.</span>
           </h1>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-sm">
                 <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">Receipt ID</p>
                 <p className="text-sm font-black mono uppercase">#{order.id.slice(-8)}</p>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/20" />
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-sm text-center">
                 <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">Total Paid</p>
                 <p className="text-sm font-black uppercase tracking-widest">₹{order.totalAmount.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
        {/* Main Success Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#002366]/5 border border-slate-100 overflow-hidden">
           <div className="p-8 md:p-12 space-y-12">
              
              {/* Delivery Pulse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#002366]">
                          <MapPin className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#002366]">Shipping To</h3>
                          <p className="text-sm font-bold text-slate-500 leading-relaxed mt-1 uppercase italic">{order.address}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                          <Clock className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Expected Delivery</h3>
                          <p className="text-sm font-bold text-slate-500 mt-1 uppercase italic">5-7 Business Days</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Logistics Track</h4>
                       <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    
                    {order.trackingUrl ? (
                      <div className="space-y-4">
                         <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Courier Partner</p>
                            <p className="text-sm font-black text-[#002366] uppercase">{order.courierName || "Standard Shipping"}</p>
                         </div>
                         <a 
                           href={order.trackingUrl}
                           className="flex items-center justify-center gap-3 w-full py-4 bg-[#002366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-900/10"
                         >
                           Track Live Dispatch <ExternalLink className="w-3.5 h-3.5" />
                         </a>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                         <p className="text-[10px] font-black text-[#002366] uppercase tracking-widest">Awaiting Dispatch</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Tracking will appear once processed</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Board */}
              <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                 <Link 
                   href="/"
                   className="flex-1 flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-[#002366] hover:text-[#002366] transition-all group"
                 >
                   <ShoppingBag className="w-4 h-4" /> Return to Home
                 </Link>
                 <button 
                   onClick={() => window.print()}
                   className="flex-1 flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-[#002366] hover:text-[#002366] transition-all group"
                 >
                   <Printer className="w-4 h-4" /> Save Receipt
                 </button>
              </div>

           </div>

           {/* Receipt Minimal List */}
           <div className="bg-slate-50 p-8 md:p-12 border-t border-slate-100">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#002366] mb-8">Snapshot summary</h3>
              <div className="space-y-6">
                 {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex-shrink-0">
                             <img src={item.design?.previewImage || "/placeholder.png"} className="w-full h-full object-cover rounded-lg" />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-[#002366] uppercase tracking-tight">{item.product?.name || "Product"}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Qty: {item.quantity}</p>
                          </div>
                       </div>
                       <span className="text-sm font-black text-[#002366]">₹{item.price.toLocaleString()}</span>
                    </div>
                 ))}
                 <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[#002366]">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total Settled</span>
                    <span className="text-2xl font-black tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Support Section */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 gap-6">
           <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <p className="text-[10px] font-black text-[#002366] uppercase tracking-widest">Questions about your Atelier order?</p>
           </div>
           <Link 
             href="/contact"
             className="px-8 py-3 bg-white border border-blue-200 rounded-xl text-[10px] font-black text-[#002366] uppercase tracking-widest hover:bg-[#002366] hover:text-white transition-all shadow-sm"
           >
             Contact Logistics Support
           </Link>
        </div>
      </div>
    </div>
  );
}
