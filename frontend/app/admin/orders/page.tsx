"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MoreHorizontal,
  ChevronRight,
  Loader2,
  Calendar,
  Printer,
  Zap
} from "lucide-react";

type Order = {
  id: string;
  customerName: string;
  email: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  _count: {
    items: number;
  };
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOrders();
  }, [API_URL]);

  const fetchOrders = async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-lg text-[11px] font-medium capitalize tracking-wider flex items-center gap-1.5 border";
    switch (status) {
      case "DELIVERED":
        return <span className={`${baseClasses} bg-emerald-50 text-emerald-600 border-emerald-100/50`}><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case "SHIPPED":
        return <span className={`${baseClasses} bg-blue-50 text-blue-600 border-blue-100/50`}><Truck className="w-3 h-3" /> Shipped</span>;
      case "PRINTING":
        return <span className={`${baseClasses} bg-purple-50 text-purple-600 border-purple-100/50`}><Printer className="w-3 h-3" /> Printing</span>;
      case "PROCESSING":
        return <span className={`${baseClasses} bg-indigo-50 text-indigo-600 border-indigo-100/50`}><Zap className="w-3 h-3" /> Processing</span>;
      case "RECEIVED":
        return <span className={`${baseClasses} bg-amber-50 text-amber-600 border-amber-100/50`}><Clock className="w-3 h-3" /> Received</span>;
      case "CANCELLED":
        return <span className={`${baseClasses} bg-rose-50 text-rose-600 border-rose-100/50`}><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-slate-50 text-slate-500 border-slate-200`}>{status}</span>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Orders</h1>
          <p className="text-base  text-slate-900 mt-1 capitalize tracking-wider text-[11px] opacity-80">Manage customer transactions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:border-blue-500 transition-all outline-none w-72 shadow-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-900  capitalize tracking-widest text-[12px]">Updating records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-32 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">No orders found</h3>
            <p className="text-base  text-slate-900 mt-2 opacity-60">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[12px]  text-slate-900 capitalize tracking-widest">Order Details</th>
                  <th className="px-8 py-5 text-left text-[12px]  text-slate-900 capitalize tracking-widest">Customer</th>
                  <th className="px-8 py-5 text-left text-[12px]  text-slate-900 capitalize tracking-widest">Date</th>
                  <th className="px-8 py-5 text-left text-[12px]  text-slate-900 capitalize tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-left text-[12px]  text-slate-900 capitalize tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-[12px]  text-slate-900 capitalize tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                   <tr 
                     key={order.id}
                     onClick={() => router.push(`/admin/orders/${order.id}`)}
                     className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                   >
                     <td className="px-8 py-5">
                       <span className="text-base font-medium text-slate-900 block leading-tight">#{order.id.slice(-6).toUpperCase()}</span>
                       <span className="text-[12px]  text-slate-900 mt-0.5 block opacity-60">{order._count.items} items</span>
                     </td>
                     <td className="px-8 py-5">
                       <span className="text-base font-medium text-slate-900 block leading-tight">{order.customerName}</span>
                       <span className="text-[12px]  text-slate-900 mt-0.5 block opacity-60">{order.email}</span>
                     </td>
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-slate-600 font-medium text-[13px]">
                         <Calendar className="w-3.5 h-3.5 text-slate-400" />
                         {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                       </div>
                     </td>
                     <td className="px-8 py-5">
                       <span className="text-base font-medium text-slate-900 block">₹{order.totalAmount.toLocaleString()}</span>
                     </td>
                     <td className="px-8 py-5">
                       {getStatusBadge(order.orderStatus)}
                     </td>
                     <td className="px-8 py-5 text-right">
                       <div className="p-2 text-slate-300 group-hover:text-blue-600 transition-all inline-block">
                         <ChevronRight className="w-4 h-4" />
                       </div>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
