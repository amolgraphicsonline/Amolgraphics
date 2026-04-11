"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from "@/context/CartContext";

const resolveMedia = (path: string, apiUrl: string) => {
   if (!path) return "/placeholder.jpg";
   if (path.startsWith('http')) return path;
   const baseUrl = apiUrl.replace('/api', '');
   const cleanPath = path.startsWith('/') ? path : `/${path}`;
   return `${baseUrl}${cleanPath}`;
};

export default function PrintshoppyHeader({ settings, categories }: { settings: any, categories: any[] }) {
  const router = useRouter();
  const { cartItemsCount, setIsOpen } = useCart();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  return (
    <header className="w-full bg-white font-sans text-gray-800 relative z-50 shadow-sm border-b border-gray-100">
      {/* Top White Bar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Brand Name / Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            {settings?.logo && (
               <img
                  src={resolveMedia(settings.logo, API_URL)}
                  alt={settings?.storeName || 'Store'}
                  style={{ height: `${Math.min(settings?.logoHeight || 30, 45)}px` }}
                  className="object-contain"
               />
            )}
            <div className="flex flex-col items-start justify-center -space-y-1">
               <span
                  style={{ fontFamily: "var(--font-comfortaa), Comfortaa, cursive" }}
                  className="text-[24px] md:text-[30px] tracking-tight leading-none capitalize text-[#F25A24] antialiased"
               >
                  {settings?.storeName?.split(' ')[0] || "Amol"}
               </span>
               <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.25em] text-[#64748b] ml-1">
                  {settings?.storeName?.split(' ').slice(1).join(' ') || "Graphics"}
               </span>
            </div>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex gap-6 text-[13px] font-normal text-gray-600 flex-1 justify-center">
          <Link href="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link>
          <Link href="/faq" className="hover:text-amber-500 transition-colors">FAQ's</Link>
          <Link href="/account" className="hover:text-amber-500 transition-colors">Track Order</Link>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center justify-end gap-6 text-[13px] font-normal text-gray-600">
          <Link href="/account" className="hover:text-amber-500 transition-colors hidden sm:block">
            Login / Register
          </Link>
          <button
             onClick={() => setIsOpen(true)}
             className="relative text-gray-800 hover:text-amber-500 transition-colors"
          >
             <ShoppingCart size={24} strokeWidth={1.5} />
             {cartItemsCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                 {cartItemsCount}
               </span>
             )}
          </button>
        </div>
      </div>

      {/* Trust Badges Ribbon - Seamless Marquee */}
      <div className="bg-[#122A4E] text-white py-2 overflow-hidden whitespace-nowrap border-b-[3px] border-[#DFA238] flex relative">
        <div className="flex animate-marquee min-w-max w-max items-center font-medium tracking-wide text-[11px] md:text-[13px]">
          {/* Create two identical blocks for a seamless infinite loop */}
          {[1, 2].map((groupKey) => (
            <div key={groupKey} className="flex items-center gap-8 md:gap-16 px-4 md:px-8">
              <div className="flex items-center gap-2">
                <span className="text-[#DFA238]">✨</span>
                <span className="border border-[#DFA238] text-[#DFA238] px-2 py-0.5 rounded-full text-[10px] md:text-[11px]">EST. 2024</span>
                <span className="text-white ml-1">Trusted By Millions</span>
              </div>
              <div className="flex items-center gap-2 text-[#DFA238]">
                <span>🏆</span>
                <span className="text-[#DFA238]">1 Crore+ Photos Printed</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-blue-400">💎</span>
                <span>Crafted With Premium Materials</span>
              </div>
              <div className="flex items-center gap-2 text-[#DFA238]">
                <span>📄</span>
                <span className="text-[#DFA238]">Professional Grade Printing</span>
              </div>
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
      </div>
    </header>
  );
}
