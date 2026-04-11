"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Phone, MessageSquare } from "lucide-react";

export default function PrintshoppyFooter({ settings }: { settings: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  return (
    <footer className="relative bg-[#0B1E40] pt-12 pb-6 px-4 md:px-8 border-t border-white/5 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* 1. INTEGRATED INFORMATIONAL LINK GRID (COMPACT DARKS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-white/5 pb-12">
          <div className="text-left">
            <h3 className="font-extrabold text-white text-xs tracking-[0.1em] uppercase pb-1 border-b border-white/20 inline-block mb-5">COMPANY</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about-us' },
                { label: "T&C's", href: '/terms-and-conditions' },
                { label: 'Refer & Earn', href: '#' }
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="text-white/60 font-medium hover:text-white transition-colors uppercase text-[11px] tracking-wider">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-white text-xs tracking-[0.1em] uppercase pb-1 border-b border-white/20 inline-block mb-5">BEST SELLERS</h3>
            <ul className="space-y-2">
              {['Wall Photo Frames', 'Photo Stands', 'Mobile Cases', 'Photo Mugs'].map(item => (
                <li key={item}><Link href="/shop" className="text-white/60 font-medium hover:text-white transition-colors uppercase text-[11px] tracking-wider">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-white text-xs tracking-[0.1em] uppercase pb-1 border-b border-white/20 inline-block mb-5">SUPPORT</h3>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Track Order', href: '/account' },
                { label: 'Return Order', href: '/account' },
                { label: "FAQ's", href: '/faq' }
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="text-white/60 font-medium hover:text-white transition-colors uppercase text-[11px] tracking-wider">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-white text-xs tracking-[0.1em] uppercase pb-1 border-b border-white/20 inline-block mb-5">MORE INFO</h3>
            <ul className="space-y-2">
              {['My Account', 'Order History', 'Your Credits'].map(item => (
                <li key={item}><Link href="/account" className="text-white/60 font-medium hover:text-white transition-colors uppercase text-[11px] tracking-wider">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. SOCIAL & SUPPORT ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
          {/* FOLLOW US */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] opacity-60 font-sans">FOLLOW US</h3>
            <div className="flex gap-4">
              {[
                { icon: <Facebook size={18} />, label: "FACEBOOK", href: settings?.facebookUrl },
                { icon: <Twitter size={18} />, label: "TWITTER", href: settings?.twitterUrl },
                { icon: <Instagram size={18} />, label: "INSTAGRAM", href: settings?.instagramUrl },
                { icon: <Youtube size={18} />, label: "YOUTUBE", href: settings?.youtubeUrl }
              ].map(item => (
                <Link key={item.label} href={item.href || "#"} target="_blank" className="flex flex-col items-center group">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white transition-all group-hover:-translate-y-1 hover:bg-white hover:text-[#0B1E40] shadow-sm">
                    {item.icon}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* QUICK SUPPORT (RESTORED TO BOUTIQUE PILLS) */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 md:justify-end">
            <div className="text-center md:text-right">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] mb-1 opacity-80 font-sans">SUPPORT</h3>
              <p className="text-white/40 text-[9px] uppercase font-bold tracking-tight">REAL-TIME ASSISTANCE</p>
            </div>
            <div className="flex gap-4">
              <a href={`tel:${settings?.contactPhone || '+919900000000'}`} className="flex items-center gap-3 bg-white/5 border border-blue-500/40 px-6 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all group shadow-sm">
                <Phone size={16} className="text-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] font-sans whitespace-nowrap">Phone Support</span>
              </a>
              <a href={`https://wa.me/${settings?.whatsappNumber || '919900000000'}`} className="flex items-center gap-3 bg-white/5 border border-[#25D366]/40 px-6 py-2.5 rounded-xl text-[#25D366] hover:bg-[#25D366]/10 transition-all shadow-sm">
                <MessageSquare size={16} className="text-[#25D366]" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] font-sans whitespace-nowrap">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. 100% SECURE PAYMENTS ROW */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1E40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic font-sans opacity-80">100% SECURE PAYMENTS</h3>
             </div>
            <div className="flex items-center gap-3 bg-white/5 py-1.5 px-4 rounded-lg border border-white/5">
              {[
                'google-pay', 'phone-pe', 'paytm', 'bhim', 'mastercard', 'visa'
              ].map((icon) => (
                <img key={icon} src={`https://img.icons8.com/color/48/${icon}.png`} alt={icon} loading="lazy" className="h-6 w-auto object-contain hover:scale-110 transition-transform" />
              ))}
            </div>
          </div>
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] font-sans">© 2026 {settings?.storeName?.toUpperCase() || 'AMOLGRAPHICS INC.'} • ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer>
  );
}
