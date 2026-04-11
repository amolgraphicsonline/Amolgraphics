"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, ShoppingBag, Users, BarChart3, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Package, AlertCircle, 
  Warehouse, ChevronRight, Activity, Calendar, ArrowRight,
  Loader2, CheckCircle2
} from "lucide-react";

// Normalises bar heights so the shortest bar is never < 8% and tallest = 100%.
// Prevents the "one huge bar, everything else is a sliver" problem.
function normaliseHeights(values: number[]): number[] {
  const max = Math.max(...values, 1);
  const min = Math.min(...values.filter(v => v > 0), max);
  const MIN_VIS = 8; // minimum visible bar height %
  return values.map(v => {
    if (v === 0) return 0;
    const raw = (v / max) * 100;
    // Scale so the minimum non-zero value renders at MIN_VIS%
    const minRaw = (min / max) * 100;
    if (minRaw >= MIN_VIS) return raw;
    const scale = (100 - MIN_VIS) / (100 - minRaw);
    return MIN_VIS + (raw - minRaw) * scale;
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<"7" | "30">("7");
  const [orderPage, setOrderPage]   = useState(0);
  const [stockPage, setStockPage]   = useState(0);
  const PAGE = 5;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-[12px] font-semibold text-slate-400 capitalize tracking-[0.2em]">Loading Dashboard...</p>
      </div>
    );
  }

  const stats        = data?.summary          || {};
  const recentOrders = data?.recentOrders      || [];
  const lowStock     = data?.lowStockProducts  || [];
  const allChart     = data?.salesChart        || [];
  const chartData    = chartRange === "7" ? allChart.slice(-7) : allChart.slice(-30);
  const heights      = normaliseHeights(chartData.map((d: any) => d.amount));

  // Paginated slices — max 5 rows per section
  const orderPages   = Math.ceil(recentOrders.length / PAGE);
  const stockPages   = Math.ceil(lowStock.length      / PAGE);
  const pagedOrders  = recentOrders.slice(orderPage * PAGE, orderPage * PAGE + PAGE);
  const pagedStock   = lowStock.slice(stockPage  * PAGE, stockPage  * PAGE + PAGE);

  const KPI = [
    { label: "Revenue",    value: `₹${(stats.totalRevenue||0).toLocaleString()}`, delta: "+12.5%", up: true,  icon: BarChart3,  accent: "blue"    },
    { label: "Orders",     value:  stats.totalOrders  || 0,                       delta: "+8.2%",  up: true,  icon: ShoppingBag,accent: "indigo"  },
    { label: "Products",   value:  stats.totalProducts|| 0,                       delta: `-${stats.outOfStock||0}`, up: false, icon: Warehouse, accent: "violet" },
    { label: "Customers",  value:  stats.totalCustomers||0,                       delta: "+4",     up: true,  icon: Users,      accent: "emerald" },
  ];

  const accentMap: Record<string, string> = {
    blue:    "bg-blue-50 text-blue-600",
    indigo:  "bg-indigo-50 text-indigo-600",
    violet:  "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="p-6 space-y-6 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5 capitalize tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Live Business Overview
          </p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-semibold capitalize tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((item, i) => (
          <div key={i} className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentMap[item.accent]}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 capitalize tracking-widest truncate">{item.label}</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight leading-none mt-0.5">{item.value}</p>
            </div>
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 ${item.up ? "text-emerald-600 bg-emerald-50" : "text-rose-500 bg-rose-50"}`}>
              {item.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              {item.delta}
            </span>
          </div>
        ))}
      </div>

      {/* ── Chart + Stock Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Revenue Analytics</h3>
              <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">Daily payment-verified sales</p>
            </div>
            <div className="flex gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
              {(["7", "30"] as const).map(t => (
                <button key={t}
                  onClick={() => setChartRange(t)}
                  className={`px-3 py-1 text-[11px] font-semibold capitalize rounded-lg transition-all ${chartRange === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                  {t} Days
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart — horizontal scroll when many bars */}
          <div className="flex-1 flex flex-col gap-2 overflow-x-auto" style={{ minHeight: 220 }}>
            <div className="flex-1 flex items-end gap-1.5 px-1" style={{ minWidth: chartData.length > 10 ? chartData.length * 28 : "100%" }}>
              {chartData.length > 0 ? chartData.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1 h-full group" style={{ flex: "1 0 24px" }}>
                  <div className="w-full flex-1 flex items-end">
                    <div className="relative w-full">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[12px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl">
                        ₹{d.amount.toLocaleString()}
                      </div>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-700 group-hover:to-blue-500 transition-all"
                        style={{ height: heights[i] > 0 ? `${heights[i]}%` : "2px", maxHeight: "100%", minHeight: heights[i] > 0 ? "6px" : "2px" }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="w-full flex items-center justify-center text-slate-300 text-base italic">
                  No sales data for this period
                </div>
              )}
            </div>
            {/* X-axis labels */}
            <div className="flex items-center gap-1.5 px-1" style={{ minWidth: chartData.length > 10 ? chartData.length * 28 : "100%" }}>
              {chartData.map((d: any, i: number) => (
                <div key={i} className="text-center" style={{ flex: "1 0 24px" }}>
                  <span className="text-[12px] font-medium text-slate-400 capitalize">
                    {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Stock Alerts</h3>
              <p className="text-[11px] font-semibold text-rose-500 capitalize tracking-widest mt-0.5">Low inventory items</p>
            </div>
            <div className="w-7 h-7 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
          </div>

          {/* 5-row paginated stock list */}
          <div className="flex-1 space-y-2">
            {pagedStock.length > 0 ? pagedStock.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-white transition-all group">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 text-[11px] font-semibold shrink-0">
                  {p.stock}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-900 truncate capitalize">{p.name}</p>
                  <p className="text-[12px] font-medium text-slate-400 capitalize tracking-widest">SKU: {p.sku}</p>
                </div>
                <Link href="/admin/products" className="text-slate-300 hover:text-blue-600 transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <p className="text-[12px] font-semibold text-slate-400 capitalize tracking-widest">All items in stock</p>
              </div>
            )}
          </div>
          {/* Pagination for Stock Alerts */}
          {stockPages > 1 && (
            <Pagination page={stockPage} total={stockPages} onChange={setStockPage} />
          )}

          <Link href="/admin/products"
            className="mt-4 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-semibold capitalize tracking-[0.2em] hover:bg-blue-700 transition-all text-center flex items-center justify-center gap-1.5">
            Manage Inventory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Recent Orders + Promotions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recent Orders</h3>
              <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">Latest transactions</p>
            </div>
            <Link href="/admin/orders"
              className="text-[11px] font-semibold text-blue-600 capitalize tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all border border-blue-50">
              View All
            </Link>
          </div>

          {/* 5-row paginated orders */}
          <div className="space-y-0.5">
            {pagedOrders.length > 0 ? pagedOrders.map((ord: any, i: number) => (
              <Link key={i} href={`/admin/orders/${ord.id}`}
                className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-semibold text-[11px] group-hover:border-blue-200 group-hover:text-blue-600 transition-all shrink-0">
                  #{ord.id.slice(-4)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 truncate leading-none">{ord.customerName}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-semibold text-slate-900">₹{ord.totalAmount.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ord.orderStatus === "RECEIVED" ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span className={`text-[12px] font-semibold capitalize tracking-widest ${ord.orderStatus === "RECEIVED" ? "text-amber-500" : "text-emerald-500"}`}>
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-12 text-center text-slate-300 text-base italic">No recent orders</div>
            )}
          </div>
          {/* Pagination for Orders */}
          {orderPages > 1 && (
            <div className="pt-3 border-t border-slate-50">
              <Pagination page={orderPage} total={orderPages} onChange={setOrderPage} />
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Quick Actions</h3>
            <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest mt-0.5">Common management tasks</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Product",     icon: Package,     href: "/admin/products/new",  color: "blue" },
              { label: "View Orders",     icon: ShoppingBag, href: "/admin/orders",        color: "indigo" },
              { label: "Manage Designs",  icon: Activity,    href: "/admin/designs",       color: "violet" },
              { label: "Customers",       icon: Users,       href: "/admin/customers",     color: "emerald" },
              { label: "Coupons",         icon: TrendingUp,  href: "/admin/discounts",     color: "amber" },
              { label: "Shipments",       icon: Warehouse,   href: "/admin/shipments",     color: "rose" },
            ].map((action, i) => (
              <Link key={i} href={action.href}
                className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-white hover:shadow-md transition-all group">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shrink-0">
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-[12px] font-semibold text-slate-700 capitalize tracking-widest truncate">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable compact pagination control ──
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="px-3 py-1.5 text-[11px] font-semibold capitalize tracking-widest bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>
      <span className="text-[11px] font-semibold text-slate-400 capitalize tracking-widest">
        Page {page + 1} / {total}
      </span>
      <button
        onClick={() => onChange(Math.min(total - 1, page + 1))}
        disabled={page >= total - 1}
        className="px-3 py-1.5 text-[11px] font-semibold capitalize tracking-widest bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
}
