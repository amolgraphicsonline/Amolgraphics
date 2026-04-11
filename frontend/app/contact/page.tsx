"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Send, Loader2, ArrowUpRight, MessageSquare
} from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Settings error:", err));
  }, [API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
      setFormState({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = settings?.contactPhone || "+91 98906 66136";
  const displayEmail = settings?.contactEmail || "amolgraphics@gmail.com";
  const displayAddress = settings?.contactAddress || "Shop No. 01, Heramb Apartment, Shaniwar Peth, Pune, Maharashtra 411030";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">

      {/* AMBIENT BOUTIQUE LIGHTS (LAYER 0) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none -mr-40 -mt-60 z-0" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none -ml-40 -mb-80 z-0" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* COMPACT HERO SECTION (LAYER 1) */}
      <section className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-10 md:py-14 px-6 relative z-10">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px w-6 bg-blue-600/30"></span>
            <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">Connect</span>
            <span className="h-px w-6 bg-blue-600/30"></span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight font-sans">
            Contact <span className="text-blue-600">Us.</span>
          </h1>
        </div>
      </section>

      {/* MAIN CONTENT (LAYER 2 - ENSURING VISIBILITY) */}
      <main className="max-w-[1100px] mx-auto px-6 -mt-4 pb-16 relative z-20 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COMPACT FORM BLOCK - BOUTIQUE HOVER HIGHLIGHT */}
          <div className="lg:col-span-8 group/form">
            <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-6 md:p-8 border border-slate-100 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-600/100 hover:border-blue-400/80 hover:-translate-y-1 relative z-10 group-hover/form:bg-white">
              {submitted ? (
                <div className="py-16 text-center animate-in zoom-in-95">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">✓</div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Inquiry Received</h2>
                  <p className="text-slate-500 text-[13px] font-medium mb-6">Our studio team will contact you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-600 transition-all">New Entry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CompactInput label="Identity" value={formState.name} onChange={(v: string) => setFormState({ ...formState, name: v })} placeholder="FULL NAME" required />
                    <CompactInput label="Email" value={formState.email} onChange={(v: string) => setFormState({ ...formState, email: v })} placeholder="EMAIL ADDRESS" required type="email" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CompactInput label="Phone" value={formState.phone} onChange={(v: string) => setFormState({ ...formState, phone: v })} placeholder="+91..." />
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-500 ml-1">Type</label>
                      <select
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 appearance-none transition-all uppercase"
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      >
                        <option value="">SELECT CATEGORY</option>
                        <option value="custom">CUSTOM PRODUCT</option>
                        <option value="bulk">BULK ORDER</option>
                        <option value="collab">COLLABORATION</option>
                        <option value="other">GENERAL INQUIRY</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500 ml-1">Message Context</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="DESCRIBE YOUR CREATIVE VISION..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none placeholder:text-slate-300 uppercase"
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 group transition-all hover:bg-blue-700 shadow-md shadow-blue-600/10 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <span className="text-[12px] font-bold tracking-widest uppercase font-sans">Send Inquiry</span>
                        <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* SIDEBAR INFO - COMPACT */}
          <div className="lg:col-span-4 space-y-4">
            <InfoCard icon={<Mail size={16} />} label="Email" value={displayEmail} href={`mailto:${displayEmail}`} />
            <InfoCard icon={<Phone size={16} />} label="Call" value={displayPhone} href={`tel:${displayPhone}`} />
            <InfoCard icon={<MapPin size={16} />} label="Base" value="SHANIWAR PETH, PUNE" href="https://maps.google.com/?q=Amol+Graphics+Pune" />

            {/* INSTANT SUPPORT SECTION (MATCHING SCREENSHOT STYLE) */}
            <div className="bg-[#0B1E40] rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Support Hub</h3>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-6">Real-time Assistance</p>

              <div className="flex flex-col gap-3 w-full">
                <a href={`tel:${displayPhone}`} className="flex items-center justify-center gap-3 bg-white/5 border border-blue-500/30 px-5 py-2.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all group">
                  <Phone size={14} className="text-blue-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest font-sans">Phone Care</span>
                </a>
                <a href={`https://wa.me/${settings?.whatsappNumber || '919890666136'}`} className="flex items-center justify-center gap-3 bg-white/5 border border-[#25D366]/30 px-5 py-2.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-all">
                  <MessageSquare size={14} className="text-[#25D366]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest font-sans">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* COMPACT MAP SECTION */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-sans">Studio Location</h3>
            <a href={`https://maps.google.com/maps?q=${encodeURIComponent(displayAddress)}`} target="_blank" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">Directions <ArrowUpRight size={12} /></a>
          </div>
          <div className="h-[280px] w-full rounded-xl overflow-hidden border-4 border-white shadow-lg grayscale focus:grayscale-0 hover:grayscale-0 transition-all duration-700">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(displayAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
            />
          </div>
        </div>
      </main>

    </div>
  );
}

function InfoCard({ icon, label, value, href }: any) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-all group overflow-hidden relative">
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
        <p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{value}</p>
      </div>
    </a>
  );
}

function CompactInput({ label, value, onChange, placeholder, required, type = "text" }: any) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[12px] font-bold text-slate-500 ml-1">{label}</label>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 placeholder:text-slate-200 transition-all uppercase tracking-tight"
      />
    </div>
  );
}
