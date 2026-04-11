"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  Package, 
  Printer,
  ChevronLeft
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
  selectedVariantOptions: string;
};

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id && API_URL) {
      Promise.all([
        fetch(`${API_URL}/orders/${id}`).then(res => res.json()),
        fetch(`${API_URL}/settings`).then(res => res.json())
      ]).then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, API_URL]);

  if (loading) return <div className="p-20 text-center uppercase font-black tracking-widest text-slate-400">Rendering Ledger...</div>;
  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar (Hidden when printing) */}
      <div className="bg-slate-900 p-4 sticky top-0 z-50 flex items-center justify-between print:hidden">
         <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Return to Orders
         </button>
         <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Printer size={16} /> Print Official Invoice
         </button>
      </div>

      <div className="max-w-4xl mx-auto p-12 md:p-20 space-y-16 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-12">
           <div className="space-y-4">
              {settings?.logo ? (
                 <img src={settings.logo.startsWith('http') ? settings.logo : `${API_URL?.replace('/api', '')}${settings.logo}`} className="h-12 object-contain" alt="Atelier" />
              ) : (
                 <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{settings?.storeName || "AmolGraphics"}</h1>
              )}
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs">
                 {settings?.contactAddress || "Design Studio, Block B-4, Creative Park, New Delhi, India 110001"}
              </div>
           </div>
           <div className="text-right space-y-2">
              <h2 className="text-6xl font-black text-slate-200 uppercase tracking-tighter leading-none mb-4 italic">Invoice.</h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Number</div>
              <div className="text-lg font-black text-slate-900 uppercase">#{order.id.slice(-8).toUpperCase()}</div>
           </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-20">
           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Bill To Directive</h4>
              <div className="space-y-1">
                 <p className="font-black text-xl text-slate-900 uppercase tracking-tight">{order.customerName}</p>
                 <p className="text-xs font-bold text-slate-500">{order.email}</p>
                 <p className="text-xs font-bold text-slate-500">{order.phone}</p>
              </div>
           </div>
           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Dispatch Destination</h4>
              <div className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                 {order.address}<br/>
                 {order.city}, {order.state} {order.pincode}
              </div>
           </div>
        </div>

        {/* Items Table */}
        <table className="w-full">
           <thead>
              <tr className="border-y-2 border-slate-900">
                 <th className="py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-900">Component Specification</th>
                 <th className="py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-900 w-24">Qty</th>
                 <th className="py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-900 w-32">Unit Price</th>
                 <th className="py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-900 w-32">Subtotal</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {order.items.map((item, i) => (
                 <tr key={i} className="group">
                    <td className="py-8">
                       <p className="font-black text-sm text-slate-900 uppercase tracking-tight">{item.product.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID: {item.product.sku || "Custom Design"}</p>
                    </td>
                    <td className="py-8 text-center text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</td>
                    <td className="py-8 text-right text-sm font-bold text-slate-900 tabular-nums">₹{item.price.toLocaleString()}</td>
                    <td className="py-8 text-right text-sm font-black text-slate-900 tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</td>
                 </tr>
              ))}
           </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end pt-12">
           <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                 <span>Operational Subtotal</span>
                 <span>₹{order.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                 <span>Exclusive Discounts</span>
                 <span>-₹{order.discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                 <span>GST Allocation (18%)</span>
                 <span>₹{order.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase border-b border-slate-100 pb-4">
                 <span>Logistics Asset Entry</span>
                 <span>₹{order.shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Total Ledger Balance</span>
                 <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter italic">₹{order.totalAmount.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-40 pt-20 border-t border-slate-100 text-center space-y-8">
           <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600" /> Authorized Signatory
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600" /> Payment Type: {order.paymentMethod}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600" /> Transaction Secure
              </div>
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] italic leading-loose">
              AmolGraphics Studio Collective • Crafting Bespoke Visual Masterpieces • Non-Refundable Custom Artifact
           </p>
        </div>
      </div>
    </div>
  );
}
