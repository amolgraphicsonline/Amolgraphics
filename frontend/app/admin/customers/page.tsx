"use client";

import { useState, useEffect } from "react";
import { 
  Users, Search, Mail, Phone, MapPin, 
  Trash2, Loader2, X, CheckCircle2, UserPlus, 
  TrendingUp, IndianRupee, ShoppingBag, Globe, 
  ShieldCheck, Eye, Calendar, Hash, FileText
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  type: "REGISTERED" | "GUEST";
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  orders: any[];
}

export default function CustomersPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const checkHealth = async () => {
    try {
        const res = await fetch(`${API_URL.replace('/customers', '')}/health`);
        setApiOnline(res.ok);
    } catch {
        setApiOnline(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      checkHealth();
      const res = await fetch(`${API_URL}/customers`);
      if (res.ok) {
          const data = await res.json();
          setCustomers(data);
      }
    } catch (e) {
      console.error(e);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess("Customer profile stabilized in vault.");
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => {
            setModalOpen(false);
            setSuccess("");
            fetchCustomers();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this record from view?")) return;
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.pincode?.includes(searchQuery) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#282c3f] font-inter pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-slate-200/60 px-8 py-6 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
            <TrendingUp size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl  text-slate-900 capitalize tracking-widest leading-none">Customer Intelligence Hub</h1>
            <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest mt-1.5 opacity-70">
              AGGREGATED ANALYSIS OF {customers.length} RECORDS FROM ORDERS & DATABASE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px]  capitalize tracking-tight transition-all ${apiOnline === true ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${apiOnline === true ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                {apiOnline === true ? 'System Online' : apiOnline === false ? 'Offline - Check API' : 'Syncing...'}
            </div>

            <button 
              onClick={() => setModalOpen(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            >
              <UserPlus size={16} />
              Register Identity
            </button>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10">
        
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm mb-10 border-slate-200/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              placeholder="Filter by contact, pincode, or customer name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent border-none rounded-2xl text-base font-medium outline-none"
            />
          </div>
        </div>

        {/* Intelligence Table */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 italic">Identities</th>
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 italic">Engagement Mode</th>
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 italic">Contact Point</th>
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 italic">Geographics (Pincode)</th>
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 italic">LTV Contribution</th>
                <th className="px-8 py-5 text-[12px]  text-slate-400 capitalize tracking-widest border-b border-slate-100 text-right italic">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-200">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <span className="text-[12px] font-medium capitalize tracking-[0.2em]">Synchronizing Records...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300">
                     <p className="text-[11px]  capitalize tracking-[0.3em] leading-none mb-3">No profiles generated yet</p>
                     <p className="text-[11px] font-medium opacity-60 capitalize tracking-widest max-w-xs mx-auto">Customer records will appear here as soon as orders are placed or users are registered.</p>
                  </td>
                </tr>
              ) : filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center  text-slate-400 text-base group-hover:bg-white transition-all capitalize shadow-sm">
                        {customer.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-base  text-slate-900 leading-none">{customer.name || "Anonymous identity"}</p>
                        <p className="text-[12px] font-medium text-slate-400 mt-1.5 capitalize tracking-widest opacity-60">ID: {customer.id.split('_')[1] || customer.id.slice(0,6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {customer.type === 'REGISTERED' ? (
                       <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck size={10} />
                          <span className="text-[12px]  capitalize tracking-[0.1em]">Registered Partner</span>
                       </div>
                    ) : (
                       <div className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                          <ShoppingBag size={10} />
                          <span className="text-[12px]  capitalize tracking-[0.1em]">Guest Interaction</span>
                       </div>
                    )}
                  </td>
                  <td className="px-8 py-6 space-y-2">
                     <div className="flex items-center gap-2">
                        <Mail size={10} className="text-slate-300" />
                        <p className="text-[12px] font-medium text-slate-500 capitalize tracking-tighter">{customer.email}</p>
                     </div>
                     {customer.phone && (
                        <div className="flex items-center gap-2">
                           <Phone size={10} className="text-slate-300" />
                           <p className="text-[12px] font-medium text-slate-500 capitalize tracking-tighter">{customer.phone}</p>
                        </div>
                     )}
                  </td>
                  <td className="px-8 py-6">
                    {customer.city ? (
                       <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                             <MapPin size={10} className="text-amber-500" />
                             <p className="text-[12px]  capitalize text-slate-700 tracking-tight">{customer.city}, {customer.state}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 capitalize tracking-widest ml-4">
                             <Hash size={8} /> {customer.pincode}
                          </div>
                       </div>
                    ) : (
                       <p className="text-[11px] font-medium text-slate-200 capitalize italic">Geo-Unmapped</p>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-base  text-blue-600 leading-none">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-1 opacity-60">{customer.orderCount} Order(s)</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => setViewingCustomer(customer)}
                         className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                         title="Full Analysis"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                         onClick={() => handleDelete(customer.id)}
                         className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                         title="Purge Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Customer Analysis Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-900/70 shadow-blue-900/10 animate-in zoom-in-95 duration-500">
             
             {/* Profile Summary Side */}
             <div className="md:w-1/3 bg-white p-12 flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center  text-slate-300 text-3xl mb-8 border border-slate-100 shadow-inner">
                   {viewingCustomer.name?.charAt(0) || "U"}
                </div>
                <h3 className="text-xl  text-slate-900 text-center capitalize tracking-tight leading-none mb-2">{viewingCustomer.name}</h3>
                <div className="px-4 py-1.5 bg-slate-100 rounded-xl text-[11px]  text-slate-500 capitalize tracking-widest mb-10 shadow-sm">{viewingCustomer.type} PROFILE</div>

                <div className="w-full space-y-6">
                   {[
                      { icon: <Mail size={14} />, label: "Email Address", value: viewingCustomer.email },
                      { icon: <Phone size={14} />, label: "Contact Phone", value: viewingCustomer.phone || "---" },
                      { icon: <MapPin size={14} />, label: "Base Location", value: `${viewingCustomer.city}, ${viewingCustomer.state} ${viewingCustomer.pincode}` },
                      { icon: <Calendar size={14} />, label: "Profile Since", value: new Date(viewingCustomer.createdAt).toLocaleDateString() }
                   ].map((item, i) => (
                      <div key={i}>
                         <p className="text-[12px]  text-slate-300 capitalize tracking-[0.2em] mb-1.5">{item.label}</p>
                         <div className="flex items-center gap-3 text-slate-700">
                            <span className="text-slate-400">{item.icon}</span>
                            <span className="text-[11px] font-medium capitalize tracking-tight">{item.value}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Order History Side */}
             <div className="flex-1 p-12 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-base  text-slate-400 capitalize tracking-widest">Historical Transaction Log</h4>
                   <button onClick={() => setViewingCustomer(null)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-white p-6 rounded-3xl border border-slate-100">
                      <p className="text-[11px]  text-slate-400 capitalize tracking-widest mb-1">Lifetime Spend</p>
                      <p className="text-2xl  text-blue-600">₹{viewingCustomer.totalSpent.toLocaleString()}</p>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-100">
                      <p className="text-[11px]  text-slate-400 capitalize tracking-widest mb-1">Total Engagements</p>
                      <p className="text-2xl  text-slate-900">{viewingCustomer.orderCount} Orders</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {viewingCustomer.orders.map((order, i) => (
                      <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-blue-100 transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                  <FileText size={14} />
                               </div>
                               <span className="text-[12px]  capitalize text-slate-900 tracking-tight">{order.id}</span>
                            </div>
                            <span className="text-[12px]  text-blue-600 capitalize">₹{order.totalAmount.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between pl-11">
                            <span className="text-[11px]  text-slate-400 capitalize tracking-widest">{new Date(order.createdAt).toDateString()}</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                               <span className="text-[12px]  capitalize tracking-tight text-slate-500">{order.orderStatus}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Direct Enrollment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-900/60 shadow-blue-900/10">
            <form onSubmit={handleCreate}>
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h3 className="text-base  text-slate-900 capitalize tracking-widest leading-none">Manual Account</h3>
                        <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-1.5">Direct identity issuance</p>
                    </div>
                    <button type="button" onClick={() => setModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X size={18} /></button>
                </div>
                
                <div className="p-10 space-y-6">
                    {success && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <p className="text-[12px] font-medium text-emerald-600 capitalize tracking-widest">{success}</p>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1">Full Legal Name</label>
                        <input 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium outline-none focus:bg-white transition-all ring-blue-500/10 focus:ring-4"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1">Digital Connection</label>
                        <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium outline-none focus:bg-white transition-all ring-blue-500/10 focus:ring-4"
                            placeholder="identity@network.hub"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px]  text-slate-400 capitalize tracking-widest pl-1">Access Protocol</label>
                        <input 
                            required
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium outline-none focus:bg-white transition-all ring-blue-500/10 focus:ring-4"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="p-10 bg-slate-50/50 flex flex-col gap-3">
                    <button 
                        disabled={saving}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 active:scale-95"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        Confirm Issuance
                    </button>
                    <p className="text-center text-[7px] font-medium text-slate-400 capitalize tracking-widest opacity-60">
                        Profile will be issued with persistent USER privileges.
                    </p>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
