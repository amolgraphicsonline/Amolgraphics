"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
}

export const CategoryBanner = ({
  categoryId,
  showButton = true
}: {
  categoryId?: string,
  showButton?: boolean
}) => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!API_URL) return;
    const fetchBanner = async () => {
      setLoading(true);
      setError(false);
      try {
        const url = categoryId
          ? `${API_URL}/banners/category/${categoryId}`
          : `${API_URL}/banners?isDefault=true`; // Fallback to a default if implemented or just active banners
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();

        if (res.ok && data && data.id) {
          setBanner(data);
        } else if (!categoryId) {
          // Fallback to first active banner ONLY if we're not looking for a specific category
          const allRes = await fetch(`${API_URL}/banners`, { cache: 'no-store' });
          const allData = await allRes.json();
          if (Array.isArray(allData) && allData.length > 0) {
            setBanner(allData[0]);
          } else {
            setBanner(null);
          }
        } else {
          // If category banner is missing, don't show a random one
          setBanner(null);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [categoryId, API_URL]);

  if (loading) return (
    <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-slate-100 animate-pulse flex items-center justify-center rounded-3xl overflow-hidden mb-8">
      <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
    </div>
  );

  if (!banner) return null;

  const resolveMedia = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL?.replace("/api", "")}${url}`;
  };

  return (
    <section className="relative w-full aspect-[21/9] md:aspect-[3.5/1] bg-slate-900 rounded-xl overflow-hidden group mb-10 shadow-2xl">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        <img
          src={resolveMedia(banner.imageUrl)}
          alt={banner.title}
          className="w-full h-full object-cover grayscale-0"
        />
        {/* Modern Overlay Gradients - Lightened for visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-10 md:px-20 max-w-4xl space-y-6">
        <div className="space-y-4 animate-in slide-in-from-left-8 duration-700">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Premium Selection</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
            {banner.title.split(" ").map((word, i) => (
              <span key={i} className={i === 1 ? "text-orange-300 block" : ""}>
                {word}{" "}
              </span>
            ))}
          </h1>

          {banner.subtitle && (
            <p className="text-lg md:text-xl text-white/50 font-medium max-w-xl leading-relaxed">
              {banner.subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
