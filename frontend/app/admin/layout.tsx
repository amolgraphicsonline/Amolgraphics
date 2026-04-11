"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Box, Layers, ShoppingCart, Users, Settings, Bell, 
  Menu, X, ChevronRight, LogOut, ExternalLink, Activity, ImageIcon, 
  Tag, Ticket, MessageCircle, Eye, EyeOff, ArrowRightCircle, Search
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

// ─────────────────────────────────────────────
//  Menu definition
// ─────────────────────────────────────────────
interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
  count?: number;
}

const MENU: { section?: string; items: MenuItem[] }[] = [
  {
    items: [
      { label: "Dashboard",  icon: <LayoutDashboard size={17} />, href: "/admin" },
    ],
  },
  {
    section: "Catalog",
    items: [
      { label: "Categories", icon: <Layers size={17} />,    href: "/admin/categories" },
      {
        label: "Products", icon: <Box size={17} />,
        children: [
          { label: "All Products",    href: "/admin/products" },
          { label: "Add Product",     href: "/admin/products/create" },
          { label: "Product Designs", href: "/admin/designs" },
        ],
      },
      { label: "Brands", icon: <Tag size={17} />, href: "/admin/brands" },
      { label: "Category Banners", icon: <ImageIcon size={17} />, href: "/admin/banners" },
      { label: "Media",      icon: <ImageIcon size={17} />, href: "/admin/media" },
    ],
  },
  {
    section: "Sales",
    items: [
      {
        label: "Orders", icon: <ShoppingCart size={17} />,
        children: [
          { label: "All Orders",   href: "/admin/orders" },
          { label: "Shipments",    href: "/admin/shipments" },
        ],
      },
      { label: "Customers", icon: <Users size={17} />,  href: "/admin/customers" },
      { label: "Coupons",   icon: <Ticket size={17} />, href: "/admin/discounts" },
      { label: "Messages",  icon: <MessageCircle size={17} />, href: "/admin/messages", count: 3 },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", icon: <Settings size={17} />, href: "/admin/settings" },
    ],
  },
];

// ─────────────────────────────────────────────
//  Layout
// ─────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const { user, isLoaded, login, isLoggingIn } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Close mobile drawer when route changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Activity className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-[13px] font-medium text-slate-400 capitalize tracking-[0.3em]">Checking Access</p>
         </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  Admin Security Portal / Login Gate
  // ─────────────────────────────────────────────
  if (!user || user.role !== "admin") {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err.message || "Invalid credentials");
      }
    };

    return (
      <div className="flex min-h-screen bg-[#0B1E40] items-center justify-center p-4 relative overflow-hidden font-sans">
         {/* Premium Ambient Background */}
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.15),_transparent_40%)] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.05),_transparent_40%)] pointer-events-none" />

         <div className="w-full max-w-[340px] bg-white/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 md:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 mx-auto">
            <div className="flex flex-col items-center text-center mb-5">
               <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] mb-4 transform hover:rotate-6 transition-transform">
                  <Activity size={22} />
               </div>
               <h1 className="text-xl font-bold text-slate-800 tracking-tight capitalize">Master <span className="text-blue-600">Admin</span></h1>
               <p className="text-[10px] font-bold text-slate-400 capitalize tracking-[0.2em] mt-2 border-t border-slate-100 pt-2 inline-block">Secure Protocol Access</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-3">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest ml-1">Administration Email</p>
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@amolgraphics.in" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                        required
                     />
                  </div>
                  <div className="space-y-1 relative">
                     <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest ml-1">Security Credentials</p>
                     <div className="relative">
                        <input 
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="••••••••••••" 
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                           required
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                           {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                     </div>
                  </div>
               </div>
               
               {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold capitalize tracking-widest text-center p-2 rounded-lg">
                     {error}
                  </div>
               )}
 
               <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold capitalize tracking-[0.2em] rounded-lg py-3 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-[0_10px_20px_rgba(37,99,235,0.2)] group mt-2"
               >
                  {isLoggingIn ? 'Authenticating...' : (
                    <span className="flex items-center gap-2">
                       Access System <ArrowRightCircle size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] font-sans">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen z-50
          flex flex-col bg-[#0B1E40] border-r border-white/5
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-[64px]" : "w-[230px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo row */}
        <div className={`flex items-center h-[56px] border-b border-white/5 shrink-0 ${collapsed ? "justify-center px-0" : "px-4 gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Activity size={15} />
          </div>
          {!collapsed && (
            <span className="text-[14px] font-medium text-white tracking-tight whitespace-nowrap overflow-hidden">
              Amol<span className="text-blue-500 italic">Graphics</span>
            </span>
          )}
          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`ml-auto hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all ${collapsed ? "mx-auto" : ""}`}
          >
            {collapsed ? <ChevronRight size={13} /> : <X size={13} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
          {MENU.map((group, gi) => (
            <div key={gi}>
              {/* Section label */}
              {group.section && !collapsed && (
                <p className="mt-5 mb-1 px-2 text-[12px] text-blue-400/40 capitalize tracking-[0.3em]">
                  {group.section}
                </p>
              )}
              {group.section && collapsed && <div className="my-2 mx-auto w-6 border-t border-white/5" />}

              {group.items.map((item, ii) => (
                <NavItem
                  key={ii}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer (user card) */}
        <div className={`border-t border-white/5 p-2 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 text-[13px] font-semibold">A</div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 text-[13px] font-semibold shrink-0">A</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[12px] font-medium text-white leading-tight truncate">Amol Admin</p>
                <p className="text-[12px] text-slate-500 truncate">admin@amolgraphics.in</p>
              </div>
              <LogOut size={13} className="text-slate-500 group-hover:text-red-400 transition-colors shrink-0" />
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-5 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
              onClick={() => setMobileOpen(o => !o)}
            >
              <Menu size={18} />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group focus-within:bg-white focus-within:border-blue-400/50 transition-all">
              <Search size={13} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-[12px] font-medium text-slate-700 placeholder:text-slate-400 w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 mr-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-semibold text-slate-500 capitalize tracking-widest">Store Live</span>
            </div>

            <Link href="/" target="_blank"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <ExternalLink size={14} />
            </Link>

            <button className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <Link href="/admin/settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <Settings size={14} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  NavItem — handles both flat links and nested groups
// ─────────────────────────────────────────────
function NavItem({
  item, collapsed, pathname
}: {
  item: MenuItem;
  collapsed: boolean;
  pathname: string;
}) {
  const isActive = (href?: string) => href
    ? (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))
    : false;

  const hasChildren = !!item.children?.length;
  const anyChildActive = item.children?.some(c => isActive(c.href)) ?? false;
  const selfActive = !hasChildren && isActive(item.href);

  // Keep open if a child route is active
  const [open, setOpen] = useState(anyChildActive);
  useEffect(() => { if (anyChildActive) setOpen(true); }, [anyChildActive]);

  const activeClass = "bg-blue-600 text-white shadow-lg shadow-blue-600/20";
  const inactiveClass = "text-slate-400 hover:bg-white/5 hover:text-blue-400";

  if (!hasChildren) {
    return (
      <Link
        href={item.href!}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-2.5 px-2 py-2 rounded-xl text-[12px] font-medium transition-all group ${selfActive ? activeClass : inactiveClass} ${collapsed ? "justify-center" : ""}`}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate tracking-wide">{item.label}</span>
            {item.count && item.count > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2">
                {item.count}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  }

  // Group
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-[12px] font-medium transition-all group ${anyChildActive ? "text-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-blue-400"} ${collapsed ? "justify-center" : ""}`}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate tracking-wide">{item.label}</span>
            <ChevronRight size={13} className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-4 pl-4 border-l border-white/5 space-y-0.5 mt-1">
          {item.children!.map((child, ci) => (
            <Link
              key={ci}
              href={child.href}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12px] font-medium transition-all ${isActive(child.href) ? "text-white bg-white/5" : "text-slate-500 hover:text-blue-400"}`}
            >
              {child.icon ? <span className="shrink-0">{child.icon}</span> : <div className="w-1 h-1 rounded-full bg-current opacity-30 shrink-0" />}
              <span className="truncate tracking-tight">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
