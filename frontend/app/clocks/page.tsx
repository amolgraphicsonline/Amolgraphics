"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Clock, Sparkles, Filter, LayoutGrid, Heart, Star, Baby } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const CLOCK_DESIGNS: any[] = [];

export default function ClockCatalogPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    fetch(`${API_URL}/product-designs`)
      .then(res => res.json())
      .then(data => {
        const d = Array.isArray(data) ? data : [];
        // Filter for clock designs in your DB
        setDesigns(d.filter((x: any) => x.category?.toLowerCase().includes("clock") || x.name?.toLowerCase().includes("clock")));
        setLoading(false);
      })
      .catch(err => {
        console.error("Design fetch error:", err);
        setLoading(false);
      });
  }, []);

  const displayItems = designs.length > 0 ? designs : CLOCK_DESIGNS;

  const filteredItems = filter === 'all' 
    ? displayItems 
    : displayItems.filter((d: any) => d.category?.toLowerCase().includes(filter) || d.name?.toLowerCase().includes(filter) || d.shape?.toLowerCase().includes(filter));

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* 1. Slim Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[12px]  capitalize tracking-widest">Back to Studio</span>
           </Link>
           <h1 className="text-xl font-medium text-[#002366] tracking-tighter capitalize font-heading">Acrylic Wall Clocks</h1>
           <div className="w-24" /> 
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="bg-white py-12 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="bg-[#f2f2f2] rounded-[3rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-200/40 transition-colors" />
               
               <div className="lg:w-1/2 space-y-8 relative z-10">
                  <h2 className="text-6xl md:text-8xl  text-slate-900 tracking-tighter leading-[0.85] capitalize">
                    Acrylic <br /><span className="text-blue-600">Wall Clocks</span>
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                    In the world of time, nothing lasts forever, but memories do. Keep them ticking.
                  </p>
                  <div className="flex items-center gap-6 pt-4">
                     <span className="text-base font-medium text-slate-800 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        India&apos;s #1 Choice
                     </span>
                     <span className="text-base font-medium text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Premium Glass Finish
                     </span>
                  </div>
               </div>

               <div className="lg:w-1/2 flex justify-center relative z-10">
                  <div className="relative w-80 h-80 md:w-96 md:h-96">
                     <div className="absolute inset-0 bg-white rounded-full shadow-2xl overflow-hidden scale-110 p-2">
                         <img src="/placeholder.jpg" className="w-full h-full object-cover rounded-full opacity-10" alt="Clock Hero" />
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/30 pointer-events-none" />
                     </div>
                     {/* Clock Hands Mock */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none p-8 z-20">
                        <div className="w-full h-full relative">
                           <div className="absolute top-1/2 left-1/2 w-[40%] h-[4px] bg-slate-900 origin-left rotate-[310deg] rounded-full shadow-lg" />
                           <div className="absolute top-1/2 left-1/2 w-[30%] h-[4px] bg-slate-900 origin-left rotate-[-50deg] rounded-full shadow-lg" />
                           <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-xl -translate-x-1/2 -translate-y-1/2" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
         <div className="text-center mb-10 space-y-2">
            <h5 className="text-[11px]  text-blue-600 capitalize tracking-[0.4em]">Choose a shape to customize</h5>
         </div>

         <div className="flex flex-wrap items-center justify-center gap-4 py-6 border-b border-slate-100 mb-12">
            <button onClick={() => setFilter("all")} className={`px-8 py-4 rounded-xl flex items-center gap-3 transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}>
               <LayoutGrid className="w-4 h-4" />
               <span className="text-[12px]  capitalize tracking-widest font-heading">All Designs</span>
            </button>
            <FilterTab active={filter === "classic"} onClick={() => setFilter("classic")} icon={<Clock className="w-4 h-4" />} label="Classic" />
            <FilterTab active={filter === "kids"} onClick={() => setFilter("kids")} icon={<Baby className="w-4 h-4" />} label="Kids" />
            <FilterTab active={filter === "popular"} onClick={() => setFilter("popular")} icon={<Star className="w-4 h-4" />} label="Popular" />
         </div>

         {/* 5. Design Grid */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center animate-pulse">
                <p className="text-slate-400 font-medium capitalize tracking-widest">No Clock Designs Found. Add some in Admin Panel!</p>
              </div>
            )}
            {filteredItems.map((d: any) => (
               <Link 
                 key={d.id} 
                 href={`/studio-v2?designId=${d.id}&shape=${d.shape || 'circle'}&category=${d.category || 'clocks'}`}
                 className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500"
               >
                  <div className="relative aspect-[4/5] bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
                     <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                     <div className="w-full h-full relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                        <img 
                          src={d.previewImage?.startsWith('http') ? d.previewImage : d.previewImage ? `${API_URL.replace('/api', '')}/${d.previewImage}` : '/placeholder.jpg'} 
                          className="w-full h-full object-contain" 
                          alt={d.name} 
                        />
                        {/* Clock Numbers Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity  text-slate-900">
                           <div className="w-full h-full relative">
                              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
                                 const ang = (i * 30 * Math.PI) / 180;
                                 return (
                                   <span key={num} className="absolute text-[12px]" style={{
                                     top: `${50 - 42 * Math.cos(ang)}%`,
                                     left: `${50 + 42 * Math.sin(ang)}%`,
                                     transform: 'translate(-50%, -50%)'
                                   }}>{num}</span>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="p-1 space-y-0.5">
                     <div className="w-full bg-blue-600 text-white py-5 flex items-center justify-between px-8 text-[11px]  capitalize tracking-widest hover:bg-[#002366] transition-all group-hover:px-10">
                        <span>Start Design</span>
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </section>
    </div>
  );
}

function FilterTab({ icon, label, onClick, active }: any) {
  return (
    <button onClick={onClick} className={`px-6 md:px-10 py-4 rounded-xl flex items-center gap-3 transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}>
      {icon}
      <span className="text-[12px]  capitalize tracking-widest font-heading">{label}</span>
    </button>
  );
}
