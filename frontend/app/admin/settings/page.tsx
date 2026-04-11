"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Save, Image as ImageIcon, Globe, Info, 
  Smartphone, Mail, ShieldCheck, Zap,
  Upload, Trash2, Check, AlertCircle, Loader2,
  Instagram, Facebook, MapPin, Phone, Linkedin, Youtube,
  Type, Type as FontIcon, Type as TextSize
} from "lucide-react";

const SettingsInputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[12px]  text-slate-900 capitalize tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />}
      <input 
        type={type} 
        value={value || ""}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-12' : 'px-5'} py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    storeName: "AmolGraphics",
    subHeadline: "THE STUDIO COLLECTIVE",
    logo: "",
    logoHeight: 100,
    whatsappProvider: "TWILIO",
    whatsappApiKey: "",
    whatsappInstanceId: "",
    whatsappFromNumber: "",
    whatsappNumber: "",
    smsEnabled: false,
    emailEnabled: true,
    paymentSandboxMode: true,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    orderNotificationEmail: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    showStoreNameInHeader: true,
    storeNameFont: "Inter",
    storeNameSize: 24,
    defaultShippingFee: 0,
    taxInclusive: true,
    taxRate: 18.0
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings synchronized successfully.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to synchronize settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network connection error. Protocol failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const updatedSettings = { ...settings, logo: data.url };
        setSettings(updatedSettings);

        // Auto-save the logo path to settings
        await fetch(`${API_URL}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });

        setMessage({ type: 'success', text: 'Logo asset synchronized globally.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Logo synchronization failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setSaving(true);
      const updatedSettings = { ...settings, logo: "" };
      setSettings(updatedSettings);

      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Logo removed successfully.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove logo asset.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[blue-600] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-32 font-sans">
      {/* Professional Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl  text-blue-600 tracking-tight capitalize">Control Center</h1>
            <p className="text-[12px] font-medium text-slate-900 capitalize tracking-widest">Global Configuration & Infrastructure</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl text-[11px]  capitalize tracking-widest shadow-lg hover:shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update Changes
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-[12px]  capitalize tracking-widest">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Identity & Visual Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-[11px]  text-blue-600 capitalize tracking-widest">Brandmark</h3>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:bg-blue-50/30 hover:border-blue-600/30 transition-all overflow-hidden"
              >
                {settings.logo ? (
                  <img 
                    src={settings.logo.startsWith('http') ? settings.logo : `${API_URL.replace('/api', '')}${settings.logo}`} 
                    className="max-w-full max-h-full object-contain p-4" alt="Logo" 
                  />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[11px]  text-slate-900 capitalize tracking-widest mt-3">Select Image</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
              
              {settings.logo && (
                <button 
                  onClick={handleRemoveLogo}
                  className="w-full py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[11px]  capitalize tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 -mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Logo
                </button>
              )}

              <div className="w-full space-y-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Logo Display Size</label>
                  <span className="text-[12px]  text-blue-600 capitalize tabular-nums bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{settings.logoHeight || 100}px</span>
                </div>
                
                <div className="px-1">
                  <input 
                    type="range" 
                    min="20" 
                    max="200" 
                    step="1"
                    value={settings.logoHeight || 100} 
                    onChange={(e) => setSettings({...settings, logoHeight: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-600 transition-all"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[12px] font-medium text-slate-300 capitalize">Min</span>
                    <span className="text-[12px] font-medium text-slate-300 capitalize">Max</span>
                  </div>
                </div>

                <p className="text-[11px] font-medium text-slate-900 text-center capitalize tracking-widest leading-relaxed pt-2 border-t border-slate-100">
                  Slide to adjust your brand's prominence.<br/>
                  Best range: 60px - 100px.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white space-y-4 shadow-xl shadow-blue-900/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-[11px]  capitalize tracking-widest">Data Stability</h4>
            </div>
            <p className="text-[12px] text-blue-200/80 leading-relaxed font-medium capitalize tracking-tight">
              All infrastructure variables are encrypted before synchronization with the core ledger.
            </p>
          </div>
        </div>

        {/* Global Settings Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Financial Infrastructure */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/30">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[11px]  text-emerald-900 capitalize tracking-widest">Financial Infrastructure</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Default Shipping Fee</label>
                  <span className="text-[12px]  text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">INR</span>
                </div>
                <input 
                  type="number" 
                  value={settings.defaultShippingFee}
                  onChange={(e) => setSettings({...settings, defaultShippingFee: parseFloat(e.target.value)})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-blue-600 focus:outline-none focus:border-emerald-600 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Tax (GST) Logic</label>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => setSettings({...settings, taxInclusive: true})} 
                     className={`py-3 rounded-xl text-[11px]  capitalize tracking-widest transition-all border ${settings.taxInclusive ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                   >
                     Inclusive
                   </button>
                   <button 
                     onClick={() => setSettings({...settings, taxInclusive: false})} 
                     className={`py-3 rounded-xl text-[11px]  capitalize tracking-widest transition-all border ${!settings.taxInclusive ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                   >
                     Exclusive
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-[12px]  capitalize tracking-widest ${settings.taxInclusive ? 'text-slate-400' : 'text-slate-900'}`}>Tax (GST) Rate</label>
                  <span className={`text-[12px]  px-2 py-0.5 rounded border ${settings.taxInclusive ? 'text-slate-400 bg-slate-50 border-slate-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>%</span>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                    disabled={settings.taxInclusive}
                    className={`w-full px-5 py-3.5 border rounded-xl text-[12px] font-medium transition-all ${settings.taxInclusive ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-blue-600 focus:outline-none focus:border-emerald-600'}`}
                    placeholder="18.0"
                  />
                  {settings.taxInclusive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[11px]  text-slate-300 capitalize tracking-widest">N/A — Inclusive</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
               <p className="text-[11px] font-medium text-slate-900 text-center capitalize tracking-widest italic">Default setup: GST is inclusive and Shipping is Free (0.00)</p>
            </div>
          </section>

          {/* Metadata Section */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-[11px]  text-blue-600 capitalize tracking-widest">General Identity</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInputField 
                label="Business Designation" 
                value={settings.storeName} 
                onChange={(e:any) => setSettings({...settings, storeName: e.target.value})}
                placeholder="EX: AMOL GRAPHICS"
              />
              <SettingsInputField 
                label="Atelier Headline" 
                value={settings.subHeadline} 
                onChange={(e:any) => setSettings({...settings, subHeadline: e.target.value})}
                placeholder="EX: THE STUDIO COLLECTIVE"
              />
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Type className="w-4 h-4 text-blue-600" />
                  <h4 className="text-[11px]  text-blue-600 capitalize tracking-widest">Typography Branding</h4>
                </div>
                <div 
                  onClick={() => setSettings({ ...settings, showStoreNameInHeader: !settings.showStoreNameInHeader })}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${settings.showStoreNameInHeader ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.showStoreNameInHeader ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </div>

              {settings.showStoreNameInHeader && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[12px]  text-slate-900 capitalize tracking-widest ml-1">Font Family</label>
                    <select 
                      value={settings.storeNameFont || "Inter"} 
                      onChange={(e) => setSettings({...settings, storeNameFont: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 transition-all appearance-none"
                    >
                      <option value="Inter">Standard Sans (Inter)</option>
                      <option value="'Lexend', sans-serif">Modern Geometric (Lexend)</option>
                      <option value="'Playfair Display', serif">Elegant Serif (Playfair)</option>
                      <option value="'Outfit', sans-serif">Clean & Minimal (Outfit)</option>
                      <option value="system-ui">System Default</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[12px]  text-slate-900 capitalize tracking-widest">Font Size</label>
                      <span className="text-[12px]  text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{settings.storeNameSize || 24}px</span>
                    </div>
                    <input 
                      type="range" min="12" max="64" step="1"
                      value={settings.storeNameSize || 24} 
                      onChange={(e) => setSettings({...settings, storeNameSize: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Social & Contact Section */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-600" />
              <h3 className="text-[11px]  text-blue-600 capitalize tracking-widest">Global Reach & Contact</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <SettingsInputField 
                label="Facebook Business" 
                icon={Facebook}
                value={settings.facebookUrl} 
                onChange={(e:any) => setSettings({...settings, facebookUrl: e.target.value})}
                placeholder="https://facebook.com/..."
              />
              <SettingsInputField 
                label="Instagram Account" 
                icon={Instagram}
                value={settings.instagramUrl} 
                onChange={(e:any) => setSettings({...settings, instagramUrl: e.target.value})}
                placeholder="https://instagram.com/..."
              />
              <SettingsInputField 
                label="LinkedIn Profile" 
                icon={Linkedin}
                value={settings.linkedinUrl} 
                onChange={(e:any) => setSettings({...settings, linkedinUrl: e.target.value})}
                placeholder="https://linkedin.com/in/..."
              />
              <SettingsInputField 
                label="YouTube Channel" 
                icon={Youtube}
                value={settings.youtubeUrl} 
                onChange={(e:any) => setSettings({...settings, youtubeUrl: e.target.value})}
                placeholder="https://youtube.com/@..."
              />
              <SettingsInputField 
                label="Official Email" 
                icon={Mail}
                value={settings.contactEmail} 
                onChange={(e:any) => setSettings({...settings, contactEmail: e.target.value})}
                placeholder="atelier@example.com"
              />
              <SettingsInputField 
                label="Direct Line" 
                icon={Phone}
                value={settings.contactPhone} 
                onChange={(e:any) => setSettings({...settings, contactPhone: e.target.value})}
                placeholder="+91..."
              />
              <div className="md:col-span-2 space-y-2">
                <label className="text-[12px]  text-slate-900 capitalize tracking-widest ml-1">Studio Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-5 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <textarea 
                    rows={3}
                    value={settings.contactAddress || ""}
                    onChange={e => setSettings({ ...settings, contactAddress: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all resize-none"
                    placeholder="LOCATE YOUR STUDIO..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Communication & Payments Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <h3 className="text-[11px]  text-blue-600 capitalize tracking-widest">WhatsApp Infrastructure</h3>
                </div>
                <div 
                  onClick={() => setSettings({ ...settings, smsEnabled: !settings.smsEnabled })}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${settings.smsEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.smsEnabled ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </div>
              <div className="p-8 space-y-6 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[12px]  text-slate-900 capitalize tracking-widest ml-1">Provider Engine</label>
                      <select 
                        value={settings.whatsappProvider || "AISENSY"} 
                        onChange={(e) => setSettings({...settings, whatsappProvider: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-blue-600 focus:outline-none focus:border-blue-600 transition-all appearance-none"
                      >
                        <option value="AISENSY">AiSensy (Recommended)</option>
                        <option value="TWILIO">Twilio API</option>
                        <option value="WATI">Wati.io</option>
                        <option value="GENERIC">Generic Webhook / Other</option>
                      </select>
                   </div>
                   <SettingsInputField 
                     label="Business Number" 
                     value={settings.whatsappNumber} 
                     onChange={(e:any) => setSettings({...settings, whatsappNumber: e.target.value})}
                     placeholder="9198XXXXXXXX (With Country Code)"
                   />
                </div>

                <SettingsInputField 
                   label="API Key / Token" type="password"
                   value={settings.whatsappApiKey} 
                   onChange={(e:any) => setSettings({...settings, whatsappApiKey: e.target.value})}
                   placeholder="Your API Access Token"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SettingsInputField 
                     label="Instance ID (Optional)" 
                     value={settings.whatsappInstanceId} 
                     onChange={(e:any) => setSettings({...settings, whatsappInstanceId: e.target.value})}
                     placeholder="ID for Wati/Other"
                   />
                   <SettingsInputField 
                     label="From / Sender ID" 
                     value={settings.whatsappFromNumber} 
                     onChange={(e:any) => setSettings({...settings, whatsappFromNumber: e.target.value})}
                     placeholder="Official Number ID"
                   />
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <SettingsInputField 
                     label="Internal Notification Email" 
                     value={settings.orderNotificationEmail} 
                     onChange={(e:any) => setSettings({...settings, orderNotificationEmail: e.target.value})}
                     placeholder="admin@amolgraphics.com"
                   />
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h3 className="text-[11px]  text-blue-600 capitalize tracking-widest">Razorpay</h3>
                </div>
                <div 
                  onClick={() => setSettings({ ...settings, paymentSandboxMode: !settings.paymentSandboxMode })}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${settings.paymentSandboxMode ? 'bg-amber-500' : 'bg-blue-600'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.paymentSandboxMode ? 'left-5.5' : 'left-0.5'}`} />
                </div>
              </div>
              <div className="p-6 space-y-6 flex-grow">
                <SettingsInputField 
                   label="Key ID" type="password"
                   value={settings.razorpayKeyId} 
                   onChange={(e:any) => setSettings({...settings, razorpayKeyId: e.target.value})}
                />
                <SettingsInputField 
                   label="Secret" type="password"
                   value={settings.razorpayKeySecret} 
                   onChange={(e:any) => setSettings({...settings, razorpayKeySecret: e.target.value})}
                />
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
