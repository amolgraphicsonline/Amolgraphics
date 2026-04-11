"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function WhatsAppWidget() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Using a separate controller to allow cleanup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    fetch(`${API_URL}/settings`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.whatsappNumber) {
          const cleanNumber = data.whatsappNumber.replace(/[^0-9]/g, '');
          setWhatsappNumber(cleanNumber);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn("WhatsApp Widget: Backend settings unreachable. Hiding widget.", err.message);
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!whatsappNumber || whatsappNumber.trim() === "") return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi%20Amol%20Graphics,%20I%20have%20an%20inquiry.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 lg:bottom-10 right-6 lg:right-10 z-[9999] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-600/30 hover:scale-110 active:scale-95 transition-all group"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle size={30} className="drop-shadow-sm group-hover:-rotate-12 scale-x-[-1] transition-transform duration-300" fill="currentColor" />
      <span className="absolute right-0 top-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
    </a>
  );
}
