"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  XCircle, 
  AlertCircle, 
  RefreshCcw, 
  ShoppingBag,
  ShieldAlert,
  HelpCircle,
  PhoneCall
} from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  totalAmount: number;
  customerName: string;
};

export default function OrderFailurePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id && API_URL) {
      fetch(`${API_URL}/orders/${id}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data);
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
           <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Transaction State...</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF8F8] pb-20 selection:bg-rose-100">
      {/* Premium Failure Header */}
      <div className="bg-rose-600 text-white pt-20 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
           <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">Transaction Interrupted</span>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
              Payment Failed.<br/>
              <span className="text-rose-200 italic">Something went wrong.</span>
           </h1>
           
           <p className="text-rose-100 text-sm font-medium max-w-lg mx-auto leading-relaxed">
             Don't worry, your design masterpiece is saved. You can try the payment again or contact our support team if the amount was deducted.
           </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
        {/* Main Failure Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-rose-100/50 overflow-hidden">
           <div className="p-8 md:p-12 space-y-12">
              
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner">
                    <XCircle className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Wait, Let's Fix This</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                      Your order ID <span className="text-rose-600">#{order?.id.slice(-8) || "N/A"}</span> is currently pending payment.
                    </p>
                 </div>
              </div>

              {/* Troubleshooting Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                       <HelpCircle className="w-4 h-4 text-blue-500" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#002366]">Possible reasons</h4>
                    </div>
                    <ul className="space-y-3">
                       {['Insufficient funds', 'Incorrect card details', 'Bank server timeout', 'Transaction cancelled'].map((reason, i) => (
                          <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">
                             <div className="w-1 h-1 rounded-full bg-rose-400" />
                             {reason}
                          </li>
                       ))}
                    </ul>
                 </div>

                 <div className="p-6 bg-[#002366] rounded-3xl text-white space-y-4 shadow-xl shadow-blue-900/20">
                    <div className="flex items-center gap-3">
                       <PhoneCall className="w-4 h-4 text-blue-400" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Instant Support</h4>
                    </div>
                    <p className="text-[11px] font-bold text-blue-100 leading-relaxed uppercase italic">
                       Need help with the transaction? Our studio experts are on standby to assist you.
                    </p>
                    <Link href="/contact" className="block text-[10px] font-black uppercase underline tracking-widest hover:text-white transition-all">Connect with Atelier Support</Link>
                 </div>
              </div>

              {/* Action Board */}
              <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                 <button 
                   onClick={() => router.back()}
                   className="flex-1 flex items-center justify-center gap-3 py-5 bg-[#002366] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all group shadow-xl shadow-blue-900/10"
                 >
                   <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" /> Retry Transaction
                 </button>
                 <Link 
                   href="/"
                   className="flex-1 flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all group"
                 >
                   <ShoppingBag className="w-4 h-4" /> Return to Home
                 </Link>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
