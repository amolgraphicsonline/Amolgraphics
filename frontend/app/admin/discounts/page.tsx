"use client";

import { useEffect, useState } from "react";
import { 
  Plus, Search, Trash2, Tag, Loader2, 
  ChevronRight, MoreVertical, CheckSquare, Square, Filter, 
  ArrowUpDown, X, Save, Calendar, Ticket, Percent, 
  DollarSign, CheckCircle, Clock, AlertCircle
} from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "0",
    validUntil: "",
    usageLimit: ""
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCoupons = () => {
    if (!API_URL) return;
    setLoading(true);
    fetch(`${API_URL}/coupons`)
      .then((res) => res.json())
      .then((data) => {
        setCoupons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [API_URL]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently remove this coupon code.")) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, { method: "DELETE" });
      if (res.ok) fetchCoupons();
    } catch (error) {
       console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) fetchCoupons();
    } catch (error) {
       console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_URL) return;

    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `${API_URL}/coupons/${currentCoupon.id}` : `${API_URL}/coupons`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "0", validUntil: "", usageLimit: "" });
        fetchCoupons();
      } else {
        const err = await res.json();
        alert(err.message || "Something went wrong");
      }
    } catch (error) {
       console.error(error);
    }
  };

  const openEdit = (coupon: any) => {
    setIsEditing(true);
    setCurrentCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : ""
    });
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Coupons & Rewards</h1>
             <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[12px] font-medium capitalize tracking-wider rounded-lg border border-orange-100/50">
               {coupons.length} Active
             </span>
          </div>
          <p className="text-base font-medium text-slate-400 mt-1 capitalize tracking-wider text-[11px]">Manage discounts and promotional codes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search codes..."
              className="pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:border-orange-500 transition-all outline-none w-64 shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => { setIsEditing(false); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Code</span>
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         {[
           { label: "Active Coupons", val: coupons.filter(c => c.isActive).length, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
           { label: "Used This Month", val: "128", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
           { label: "Expired Soon", val: "3", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest">{stat.label}</p>
                 <p className="text-2xl  text-slate-900">{stat.val}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                 <stat.icon className="w-6 h-6" />
              </div>
           </div>
         ))}
      </div>

      <div className="space-y-6">
        {/* Table Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <p className="text-[12px] font-medium text-slate-400 capitalize tracking-[0.2em]">Loading Registry...</p>
             </div>
          ) : coupons.length === 0 ? (
             <div className="py-32 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 text-slate-300">
                   <Ticket className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-medium text-slate-950 tracking-tight">No Coupons Issued</h3>
                   <p className="text-base font-medium text-slate-400 max-w-xs mx-auto mt-2">Start your first promotion to drive sales.</p>
                </div>
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                         <th className="px-8 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest w-16">
                         </th>
                         <th className="px-4 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest">Coupon Code</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest">Value & Type</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest">Requirement</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest">Expiry</th>
                         <th className="px-6 py-4 text-[12px] font-medium text-slate-400 capitalize tracking-widest text-center">Status</th>
                         <th className="px-8 py-4 text-right"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {coupons.map((coupon) => (
                         <tr key={coupon.id} className="group transition-all hover:bg-slate-50/50">
                            <td className="px-8 py-6">
                               <button onClick={() => toggleSelect(coupon.id)} className={`transition-colors ${selectedIds.includes(coupon.id) ? 'text-orange-600' : 'text-slate-200 hover:text-orange-400'}`}>
                                  {selectedIds.includes(coupon.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                               </button>
                            </td>
                            <td className="px-4 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white border-2 border-blue-500 shadow-lg">
                                     <Tag size={18} />
                                  </div>
                                  <div className="space-y-0.5">
                                     <h4 className=" text-slate-900 capitalize text-[13px] tracking-wider group-hover:text-orange-600 transition-colors">{coupon.code}</h4>
                                     <p className="text-[12px] font-medium text-slate-400 capitalize leading-none">Created {new Date(coupon.createdAt).toLocaleDateString()}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-6 font-inter">
                               <div className="flex items-center gap-2">
                                  {coupon.discountType === 'PERCENTAGE' ? <Percent size={14} className="text-orange-500" /> : <DollarSign size={14} className="text-blue-500" />}
                                  <span className="text-base  text-slate-900 leading-none">
                                     {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : ' OFF'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <span className="text-[11px] font-medium text-slate-500 capitalize tracking-widest">Min. ₹{coupon.minOrderAmount}</span>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2 text-slate-400">
                                  <Calendar size={14} />
                                  <span className="text-[11px] font-medium capitalize">{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Never'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                               <button 
                                 onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                                 className={`px-3 py-1 rounded-full text-[11px]  capitalize tracking-widest border transition-all ${
                                   coupon.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                 }`}
                               >
                                 {coupon.isActive ? 'ACTIVE' : 'DISABLED'}
                               </button>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => openEdit(coupon)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                     <X className="w-4 h-4 rotate-45" /> {/* Using X as edit placeholder icon */}
                                  </button>
                                  <button onClick={() => handleDelete(coupon.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
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

      {/* Coupon Modal - Premium Design */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <h3 className="text-xl  text-slate-900 tracking-tight capitalize">{isEditing ? 'Configure Coupon' : 'New Promotion'}</h3>
                    <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest mt-1">Set discount parameters and limits</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 relative z-10">
                     <X className="w-5 h-5 text-slate-400" />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="space-y-2">
                     <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1">Promotional Code</label>
                     <div className="relative">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          required
                          placeholder="e.g. SUMMER50"
                          value={formData.code} 
                          onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          disabled={isEditing}
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl  text-slate-950 capitalize tracking-wider outline-none focus:bg-white focus:border-orange-500 transition-all text-base disabled:opacity-50"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1">Discount Type</label>
                        <select 
                          value={formData.discountType} 
                          onChange={e => setFormData({...formData, discountType: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-950 outline-none focus:bg-white focus:border-orange-500 transition-all text-base appearance-none"
                        >
                           <option value="PERCENTAGE">Percentage (%)</option>
                           <option value="FLAT">Flat Amount (₹)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1">Value</label>
                        <input 
                          required type="number"
                          placeholder="0.00"
                          value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl  text-orange-600 outline-none focus:bg-white focus:border-orange-500 transition-all text-base"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1">Min. Purchase (₹)</label>
                        <input 
                          type="number"
                          value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all text-base"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest ml-1">Valid Until</label>
                        <input 
                          type="date"
                          value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition-all text-base"
                        />
                     </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-start gap-4">
                     <AlertCircle size={18} className="text-orange-500 mt-0.5" />
                     <div className="space-y-1">
                        <p className="text-[12px]  text-orange-600 capitalize tracking-widest">Promotion Logic</p>
                        <p className="text-[11px] font-medium text-orange-700/70 leading-relaxed italic">
                           This code will be automatically validated during checkout. Existing users can use it once unless usage limits are specified.
                        </p>
                     </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                     <button 
                       type="button"
                       onClick={() => setIsModalOpen(false)} 
                       className="flex-1 py-4 text-[11px]  capitalize tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       className="flex-[2] py-4 bg-blue-600 text-white rounded-[1.2rem] text-[11px]  capitalize tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
                     >
                       {isEditing ? 'Save Changes' : 'Issue Coupon'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
