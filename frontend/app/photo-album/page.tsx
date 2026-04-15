"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Camera,
  Sparkles,
  ShieldCheck,
  Zap,
  Printer,
  Droplets,
  Layers,
  Paintbrush,
  CloudUpload,
  ArrowRight,
  Star,
  CheckCircle2
} from "lucide-react";
import PrintshoppyFooter from "@/components/ui/PrintshoppyFooter";
import { 
  Cake, Globe, Book, Map, Heart, FileText, Users, Baby, Handshake,
  LayoutGrid
} from "lucide-react";

import { CategoryBanner } from "@/components/ui/CategoryBanner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function PhotoAlbumLandingPage() {
  const [categoryData, setCategoryData] = useState<any>(null);

  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("you-and-me");
  const [reviewsData, setReviewsData] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch Categories
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const matched = data.find((c: any) => c.slug === 'photo-album');
          if (matched) setCategoryData(matched);
        }
      })
      .catch(err => console.error("Failed to fetch category:", err));

    // 2. Fetch Designs
    fetch(`${API_URL}/designs?category=photo-album`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDesigns(data);
      })
      .catch(err => console.error("Failed to fetch designs:", err));
      
    // 3. Mock/Fetch Reviews (Sync with Studio-v2 logic)
    // We'll use the mock data directly in the render for now as per studio-v2 pattern
  }, []);

  const filteredDesigns = designs.filter((d: any) => 
    d.shape?.toLowerCase() === selectedShape.toLowerCase() || 
    d.theme?.toLowerCase() === selectedShape.toLowerCase()
  );

  const themes = [
    { id: 'birthday', label: 'Birthday', icon: Cake, image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=400" },
    { id: 'international-travel', label: 'International Travel', icon: Globe, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=400" },
    { id: 'you-and-me', label: 'You & Me', icon: Heart, image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400" },
    { id: 'family', label: 'Family', icon: Users, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[12px] uppercase font-bold tracking-widest">Home</span>
          </Link>
          <div className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
            Amol <span className="text-[#1877F2]">Graphics</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      {/* Unified Global Admin Banner */}
      <div className="w-full">
        <CategoryBanner categoryId={categoryData?.id} showButton={false} />
      </div>

      {/* 2. Hero Section */}
      <section className="py-8 md:py-10 px-6 md:px-12 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          {/* Left: Album Stack */}
          <div className="relative w-full lg:w-1/2">
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 transition-transform duration-700">
              <img
                src="http://localhost:5000/uploads/image-1775925460501-797358829.jpg"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                alt="Photo Album Stack"
              />
            </div>
            {/* Elegant Price Badge */}
            <div className="absolute -bottom-3 -right-3 bg-white border border-slate-100 px-5 py-3 rounded-[1rem] shadow-lg flex flex-col items-start gap-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pricing starts at</p>
              <p className="text-xl font-black text-[#1877F2] leading-none mt-1">₹999/-</p>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-full">
                <Star className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2]" />
                <span className="text-[10px] font-bold text-[#1877F2] uppercase tracking-widest">Premium Quality Guaranteed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                A4 Size Hard Cover <br className="hidden md:block" />
                <span className="text-[#1877F2]">Photo Album</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                Relive your most precious moments with our premium hardbound albums. Craft a story that lasts a lifetime.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge text="Long Lasting" />
              <Badge text="Best Price" />
              <Badge text="Premium Built" />
            </div>

            <div className="pt-2">
              <Link
                href="/studio-v2?category=photo-album"
                className="group inline-flex items-center gap-2 bg-[#1877F2] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-blue-500/20 active:scale-95 transition-all w-full md:w-auto justify-center"
              >
                Start Designing Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Occasions Section (Theme Grid) */}
      <section className="py-10 md:py-16 px-6 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase italic">
               PHOTO ALBUM <span className="text-[#1877F2]">DESIGNS</span>
             </h2>
             <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
               Select an occasion to view curated designs for your memories.
             </p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {themes.map(theme => (
                <button 
                  key={theme.id}
                  onClick={() => setSelectedShape(theme.id)}
                  className={`group relative flex flex-col items-center gap-4 transition-all ${selectedShape === theme.id ? 'scale-105' : 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <div className={`w-full aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-500 ${selectedShape === theme.id ? 'border-[#1877F2] shadow-xl shadow-blue-500/10' : 'border-white md:group-hover:border-slate-100'}`}>
                    <img src={theme.image} className="w-full h-full object-cover" alt={theme.label} />
                  </div>
                  <div className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${selectedShape === theme.id ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    {theme.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {filteredDesigns.length > 0 ? filteredDesigns.map((design: any) => (
              <div key={design.id} className="group flex flex-col">
                <div className="relative aspect-[3/2] bg-[#f8fafc] rounded-2xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-xl transition-all mb-4">
                   <img src={`${API_URL.replace('/api', '')}${design.previewImage}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={design.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <Link
                  href={`/studio-v2?category=photo-album&designId=${design.id}&theme=${selectedShape}`}
                  className="w-full h-12 bg-[#D1EBFF] hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-between px-6 transition-all active:scale-95 group/btn"
                >
                  START DESIGN <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <LayoutGrid size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">No designs found for this theme</p>
                <p className="text-xs text-slate-400 mt-2">Try another occasion or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Smart Engine Section */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Our <span className="text-[#1877F2]">Album Process</span> <br className="hidden md:block" />
                automatically arranges and groups <br className="hidden md:block" />
                your photos
              </h2>
              <p className="text-slate-500 text-sm max-w-md">Just upload all of your favourite photos, and we handle the rest.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Step icon={<CloudUpload size={20} />} label="Upload" />
              <Step icon={<Sparkles size={20} />} label="Auto Create" color="purple" />
              <Step icon={<CheckCircle2 size={20} />} label="Publish" color="green" />
            </div>
            <div className="space-y-2 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800">Experience the magic</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Our AI seamlessly connects and arranges your photos perfectly, generating a stunning visual story flow with zero manual effort.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Smart Flow" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quality Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-4/12 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                alt="Quality Detail"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="w-full md:w-8/12 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <ShieldCheck size={14} className="text-[#1877F2]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1877F2]">Industrial Grade Quality</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Experience the <br />
                best in class quality
              </h2>
              <p className="text-base text-slate-500 max-w-xl leading-relaxed font-medium">
                Our albums are crafted using the finest materials and cutting-edge printing technology to ensure your memories are preserved with museum-grade excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <QualityItem
                icon={<Printer className="w-6 h-6 text-blue-500" />}
                title="Ultra HD Print"
                desc="Crystal clear photos with vibrant colors and sharp details on premium archival paper."
              />
              <QualityItem
                icon={<Zap className="w-6 h-6 text-amber-500" />}
                title="Fade Proof"
                desc="Special UV-resistant inks ensure colors stay vibrant for decades."
                color="orange"
              />
              <QualityItem
                icon={<Droplets className="w-6 h-6 text-teal-500" />}
                title="Spill Proof"
                desc="Advanced protective coating makes every page water-resistant and easy to clean."
                color="teal"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Configurator Preview */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Lamination Card */}
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-2/5 aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100">
              <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Lamination" />
            </div>
            <div className="w-full sm:w-3/5 space-y-3">
              <h3 className="text-xl font-bold text-slate-900">Free Glossy Lamination</h3>
              <p className="text-sm text-slate-500">
                Enhance your albums with a premium high-gloss protective layer entirely for free, ensuring unmatched longevity and vibrance.
              </p>
              <ul className="space-y-2 mt-4">
                <ListItem text="For both cover & inner pages." />
                <ListItem text="Long-lasting protection & shine." />
                <ListItem text="Requires min 25 to max 100 photos." />
              </ul>
            </div>
          </div>

          {/* Paper Types */}
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 sm:mb-0 flex-shrink-0 sm:w-1/3">Available in 2 paper types</h3>
            <div className="grid grid-cols-2 gap-4 h-full sm:w-2/3">
              <div className="space-y-2 flex flex-col group h-full">
                <div className="flex-1 min-h-[120px] bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all">
                  <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Paper Type 1" />
                </div>
                <p className="text-center font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Premium Photo Paper</p>
              </div>
              <div className="space-y-2 flex flex-col group h-full">
                <div className="flex-1 min-h-[120px] bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all">
                  <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Paper Type 2" />
                </div>
                <p className="text-center font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Non Tearable Paper</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1877F2]/40 via-slate-900 to-slate-900"></div>
        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">Ready to create your story?</h2>
          <p className="text-slate-300 text-sm md:text-base">Start organizing your memories into a beautiful hardcover album today.</p>
          <Link
            href="/studio-v2?category=photo-album"
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all mt-4"
          >
            Start Personalizing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      {/* 8. CUSTOMER SUBMITTED REVIEWS */}
      <section className="py-12 md:py-16 px-6 md:px-12 bg-[#F8F9FA] border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">What our customers say</h2>
            <div className="flex items-center justify-center gap-2">
              <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" className="h-4" alt="Google" />
              <div className="flex text-amber-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
              <span className="font-bold text-slate-400 text-xs">4.4/5 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { author_name: "sumeet gundawar", rating: 5, text: "Amol Graphics' printing on canvas flakes posters is top-notch! The colors are rich and vibrant, and the designs are crisp and clear. Highly recommended!", relative_time_description: "7 months ago" },
              { author_name: "Abhiraj Ubale", rating: 5, text: "Best Quality of Printing and Immediate Service ?? ??", relative_time_description: "2 years ago" },
              { author_name: "Vishal K", rating: 5, text: "Excellent quality printing and very professional staff.", relative_time_description: "7 months ago" },
              { author_name: "Rahul Shendge", rating: 5, text: "Very good quality", relative_time_description: "a year ago" }
            ].map((rev, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">{rev.author_name[0]}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rev.author_name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{rev.relative_time_description}</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {Array(rev.rating).fill(0).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed italic">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PrintshoppyFooter settings={{}} />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
      <span className="text-[11px] font-bold text-slate-500">{text}</span>
    </div>
  );
}

function ThemeCard({ image, label }: { image: string, label: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-500 mb-3">
        <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={label} />
      </div>
      <p className="text-center font-semibold text-slate-800 text-sm">{label}</p>
    </div>
  );
}

function Step({ icon, label, color = "blue" }: { icon: React.ReactNode, label: string, color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50/70 text-blue-600",
    purple: "bg-purple-50/70 text-purple-600",
    green: "bg-emerald-50/70 text-emerald-600"
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`p-4 rounded-xl shadow-sm border border-white ${colors[color]}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

function QualityItem({ icon, title, desc, color = "blue" }: { icon: React.ReactNode, title: string, desc: string, color?: string }) {
  const bgStyles: Record<string, string> = {
    blue: "bg-blue-50/50 text-blue-600",
    orange: "bg-amber-50/50 text-amber-600",
    teal: "bg-teal-50/50 text-teal-600"
  };
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white ${bgStyles[color]}`}>
        {icon}
      </div>
      <div className="space-y-1 pt-1">
        <h4 className="text-base font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{desc}</p>
      </div>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </li>
  );
}
