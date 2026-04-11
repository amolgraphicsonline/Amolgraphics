"use client";

import { useState, useEffect } from "react";
import { 
  Truck, 
  Package, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  MapPin,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  address: string;
  courierName?: string;
  trackingUrl?: string;
  createdAt: string;
  _count: {
    items: number;
  };
};

export default function ShipmentsDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOrders();
  }, [API_URL]);

  const fetchOrders = async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      // Filter for orders that need shipping attention
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
             <span className="text-[12px]  text-blue-600 capitalize tracking-[0.4em]">Logistics Hub</span>
          </div>
          <h1 className="text-5xl  text-[blue-600] tracking-tighter capitalize leading-none">Shipment<br/><span className="text-blue-600 italic">Tracking.</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Find dispatch ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-2xl text-[11px]  text-[blue-600] capitalize tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all w-[400px]"
              />
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
           <p className="text-[11px]  text-slate-400 capitalize tracking-widest">Updating global logistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Summary Sidebar */}
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-[blue-600] rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Truck className="w-24 h-24" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[11px]  text-blue-300 capitalize tracking-widest">Active Dispatch</p>
                    <h2 className="text-6xl  tracking-tighter">{orders.filter(o => o.orderStatus === 'SHIPPED').length}</h2>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[12px]  capitalize tracking-widest border-b border-white/10 pb-4">
                       <span className="text-blue-200">Processing</span>
                       <span>{orders.filter(o => o.orderStatus === 'PROCESSING').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]  capitalize tracking-widest border-b border-white/10 pb-4">
                       <span className="text-emerald-300">Delivered</span>
                       <span>{orders.filter(o => o.orderStatus === 'DELIVERED').length}</span>
                    </div>
                 </div>
                 <button className="w-full py-5 bg-white text-[blue-600] rounded-2xl  text-[11px] capitalize tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-white/5">
                    Generate Batch Label
                 </button>
              </div>
           </div>

           {/* Main Shipments Table */}
           <div className="lg:col-span-9 space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-10 py-8 text-[12px]  text-slate-400 capitalize tracking-widest">Manifest ID</th>
                          <th className="px-10 py-8 text-[12px]  text-slate-400 capitalize tracking-widest">Destination</th>
                          <th className="px-10 py-8 text-[12px]  text-slate-400 capitalize tracking-widest">Partner</th>
                          <th className="px-10 py-8 text-[12px]  text-slate-400 capitalize tracking-widest">Status</th>
                          <th className="px-10 py-8"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredOrders.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="p-32 text-center">
                               <div className="flex flex-col items-center gap-4 text-slate-300">
                                  <ClipboardList className="w-16 h-16" />
                                  <p className="text-[11px]  capitalize tracking-widest text-slate-400">Inventory manifestation empty</p>
                               </div>
                            </td>
                         </tr>
                       ) : filteredOrders.map((order) => (
                          <tr key={order.id} className="group hover:bg-blue-50 transition-all cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                             <td className="px-10 py-8">
                                <span className="text-base  text-[blue-600] block">#{order.id.slice(-6).toUpperCase()}</span>
                                <span className="text-[12px] font-medium text-slate-400 mt-1 block tracking-wider">{order._count.items} Items Packed</span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <MapPin className="w-4 h-4 text-slate-300" />
                                   <div>
                                      <p className="text-base  text-[blue-600] truncate max-w-[200px]">{order.customerName}</p>
                                      <p className="text-[11px] font-medium text-slate-400 capitalize truncate max-w-[200px]">{order.address}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                {order.courierName ? (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600  text-[11px] capitalize tracking-wider">
                                     <Truck className="w-3 h-3" /> {order.courierName}
                                  </div>
                                ) : (
                                  <span className="text-[12px]  text-rose-500 capitalize tracking-widest italic">NOT ASSIGNED</span>
                                )}
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <div className={`w-1.5 h-1.5 rounded-full ${
                                      order.orderStatus === 'DELIVERED' ? 'bg-emerald-500' : 
                                      order.orderStatus === 'SHIPPED' ? 'bg-blue-600 animate-pulse' : 'bg-amber-500'
                                   }`} />
                                   <span className="text-[12px]  text-[blue-600] capitalize tracking-widest">{order.orderStatus}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="p-3 text-slate-300 group-hover:text-blue-600 group-hover:bg-white rounded-xl transition-all inline-block shadow-sm">
                                   <ChevronRight className="w-4 h-4" />
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>
      )}
    </div>
  );
}
