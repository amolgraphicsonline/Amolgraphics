"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Package, LogOut, User, ShoppingBag, ChevronRight,
  Loader2, Clock, CheckCircle2, Truck, XCircle,
  MapPin, Shield, Sparkles
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  RECEIVED:   { color: "text-amber-600",  bg: "bg-amber-50  border-amber-100",  icon: <Clock size={11} />,         label: "Received" },
  PROCESSING: { color: "text-blue-600",   bg: "bg-blue-50   border-blue-100",   icon: <Sparkles size={11} />,      label: "Processing" },
  SHIPPED:    { color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100", icon: <Truck size={11} />,         label: "Shipped" },
  DELIVERED:  { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: <CheckCircle2 size={11} />, label: "Delivered" },
  CANCELLED:  { color: "text-red-500",    bg: "bg-red-50    border-red-100",    icon: <XCircle size={11} />,       label: "Cancelled" },
};

export default function AccountDashboard() {
  const { user, isLoaded, logout } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/account");
    }
  }, [isLoaded, user]);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Settings fetch error:", err));
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/auth/my-orders`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setOrders(Array.isArray(d) ? d : []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const resolveMedia = (path: string, apiUrl: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    const baseUrl = apiUrl.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#E2E8F0_0%,_transparent_25%)] pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#E2E8F0_0%,_transparent_25%)] pointer-events-none opacity-40" />
      {/* Header */}
      <header className="bg-white/80 border-b border-slate-100 sticky top-0 z-50 px-5 md:px-10 py-3.5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4 group shrink-0">
             {settings?.logo && (
                <img
                   src={resolveMedia(settings.logo, API_URL)}
                   alt={settings.storeName || "AmolGraphics"}
                   style={{ height: `${Math.min(settings?.logoHeight || 32, 36)}px` }}
                   className="w-auto object-contain"
                />
             )}
             <span className="text-lg  text-[#111111] tracking-tighter">
                {settings?.storeName?.split(' ')[0] || 'Amol'}<span className="text-blue-600">{settings?.storeName?.split(' ').slice(1).join(' ') || 'Graphics'}</span>
             </span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px]  text-slate-900 capitalize tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 space-y-10">
        {/* Profile Hero Section — Compact */}
        <div className="bg-[#0B1E40] rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl  flex-shrink-0 relative z-10 shadow-lg shadow-blue-500/20">
            {initials}
          </div>

          <div className="relative z-10 flex-1 space-y-1">
            <p className="text-[11px]  text-blue-400 capitalize tracking-[0.4em]">Member Account</p>
            <h1 className="text-2xl  text-white tracking-tighter">{user?.name || "Member"}</h1>
            <p className="text-base font-medium text-slate-300">{user?.email}</p>
          </div>

          <div className="relative z-10 flex flex-col gap-2 text-right">
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3.5 py-2">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[12px]  text-emerald-400 capitalize tracking-widest">Verified Account</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3.5 py-2">
              <Package className="w-3 h-3 text-white/60" />
              <span className="text-[12px]  text-white/80 capitalize tracking-widest">{orders.length} Masterpieces Ordered</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Shop", icon: <ShoppingBag size={18} />, href: "/shop" },
            { label: "Studio", icon: <Sparkles size={18} />, href: "/studio-v2" },
            { label: "Profile", icon: <User size={18} />, href: "#profile" },
            { label: "Track Order", icon: <Truck size={18} />, href: "#orders" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2.5 hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-600/10 flex items-center justify-center text-slate-900 group-hover:text-blue-600 transition-all">
                {action.icon}
              </div>
              <span className="text-[11px]  text-slate-900 capitalize tracking-widest leading-none">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Orders Section */}
        <div id="orders" className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl  text-[#111111] tracking-tight capitalize">My Orders</h2>
              <p className="text-[11px] font-medium text-slate-900 capitalize tracking-widest">Full order history</p>
            </div>
            <Link href="/shop" className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[11px]  text-slate-900 capitalize tracking-widest hover:border-blue-600/30 hover:text-blue-600 transition-all">
              Shop More
            </Link>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                <ShoppingBag size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl  text-[#111111] capitalize tracking-tight">No Orders Yet</h3>
                <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest">Your future masterpieces will appear here.</p>
              </div>
              <Link href="/shop" className="px-8 py-4 bg-[#111111] text-white rounded-2xl text-[12px]  capitalize tracking-widest hover:bg-orange-500 transition-all">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.RECEIVED;
                return (
                  <Link
                    key={order.id}
                    href={`/order-success/${order.id}`}
                    className="group bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-5 hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base  text-[#111111] capitalize tracking-tight">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[12px]  capitalize tracking-widest ${status.bg} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-[11px]  text-slate-900 capitalize tracking-widest">
                        <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="opacity-30">·</span>
                        <span>{order.items?.length || 0} Items</span>
                        <span className="opacity-30">·</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={9} />
                          <span>{order.city || order.state || "India"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <span className="text-xl  text-[#111111] tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-blue-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Info Section — Compact */}
        <div id="profile" className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
          <h3 className="text-lg  text-[#111111] capitalize tracking-tight">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow label="Full Name" value={user?.name || "—"} />
            <InfoRow label="Email" value={user?.email || "—"} />
            <InfoRow label="Account Type" value={user?.role === "ADMIN" ? "Administrator" : "Member"} />
            <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"} />
          </div>
          <div className="pt-5 border-t border-slate-50">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[11px]  text-emerald-600 capitalize tracking-widest leading-relaxed">
                Your session is secured with AES-256 encrypted httpOnly cookies. No sensitive data is stored in the browser.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px]  text-slate-900 capitalize tracking-[0.3em]">{label}</p>
      <p className="text-base  text-[#111111]">{value}</p>
    </div>
  );
}
