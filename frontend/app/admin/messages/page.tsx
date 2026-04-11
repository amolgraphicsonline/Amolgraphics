"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Mail, MessageSquare, Trash2, CheckCircle2, 
  ChevronRight, RefreshCw, User, Phone, Inbox, Clock,
  MoreVertical, Filter, ArrowUpRight
} from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : [];
      setMessages(msgs);
      // Auto-select first message if none selected
      if (msgs.length > 0 && !selectedMessage) {
        setSelectedMessage(msgs[0]);
      }
    } catch (err) {
      console.error("Messages fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API_URL}/contact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await fetch(`${API_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && m.status === filterStatus;
  });

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F8FAFC] flex flex-col font-sans text-[#111827]">
      {/* Top Action Bar */}
      <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-medium text-[#1E293B]">Inquiries</h1>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex gap-1">
            {["ALL", "UNREAD", "READ"].map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${filterStatus === s ? 'bg-slate-100 text-[#1E293B]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-base placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 w-48 transition-all"
            />
          </div>
          <button onClick={fetchMessages} className="p-2 text-slate-400 hover:text-[#1E293B] transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Inquiry List (30%) */}
        <div className="w-[30%] min-w-[320px] max-w-[400px] border-r border-slate-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] font-medium text-slate-400 capitalize tracking-widest">Loading...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Inbox size={24} className="mx-auto opacity-20" />
              <p className="text-[11px] font-medium">No inquiries found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === "UNREAD") updateStatus(msg.id, "READ");
                  }}
                  className={`p-4 cursor-pointer transition-all border-l-2 ${selectedMessage?.id === msg.id ? 'bg-blue-50/40 border-blue-500' : 'hover:bg-slate-50 border-transparent'}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-base font-medium text-[#1E293B] truncate max-w-[140px]">{msg.name}</span>
                    <span className="text-[11px] font-medium text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[12px]  capitalize tracking-tight">
                      {msg.subject || 'General'}
                    </span>
                    {msg.status === "UNREAD" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Detail View (70%) */}
        <div className="flex-1 bg-[#F8FAFC] overflow-y-auto p-8 lg:p-12">
          {selectedMessage ? (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-medium text-[#1E293B] mb-1">{selectedMessage.subject || 'Customer Inquiry'}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px]  capitalize tracking-widest ${selectedMessage.status === 'UNREAD' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedMessage.status}
                      </span>
                      <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
                        <Clock size={10} />
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateStatus(selectedMessage.id, selectedMessage.status === 'REPLIED' ? 'READ' : 'REPLIED')}
                    className={`p-2 rounded-lg border transition-all ${selectedMessage.status === 'REPLIED' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'}`}
                    title="Mark as Replied"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-red-200 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard icon={<User size={14} />} label="Customer" value={selectedMessage.name} />
                <InfoCard icon={<Mail size={14} />} label="Email" value={selectedMessage.email} isLink href={`mailto:${selectedMessage.email}`} />
                <InfoCard icon={<Phone size={14} />} label="Phone" value={selectedMessage.phone || 'N/A'} isLink={!!selectedMessage.phone} href={selectedMessage.phone ? `tel:${selectedMessage.phone}` : undefined} />
              </div>

              {/* Message Content */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-slate-400 capitalize tracking-widest">Inquiry Message</span>
                  <button className="text-[12px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Copy Text <ArrowUpRight size={10} />
                  </button>
                </div>
                <div className="p-8">
                  <p className="text-base text-[#334155] leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4">
                 <button className="px-4 py-2 bg-white border border-slate-200 text-[#1E293B] rounded-lg text-base font-medium hover:bg-slate-50 transition-all shadow-sm">
                   Archive Inquiry
                 </button>
                 <a 
                   href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Inquiry'}`}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                 >
                   Reply via Email <ArrowUpRight size={14} />
                 </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-200 shadow-sm">
                <Inbox size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-medium text-slate-600">No message selected</h3>
                <p className="text-base text-slate-400 max-w-[240px]">Select an inquiry from the sidebar to view full details and customer information.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}

function InfoCard({ icon, label, value, isLink, href }: { icon: any, label: string, value: string, isLink?: boolean, href?: string }) {
  const content = (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 group">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px]  capitalize tracking-widest">{label}</span>
      </div>
      <p className={`text-base font-medium truncate ${isLink ? 'text-blue-600 group-hover:text-blue-700' : 'text-[#1E293B]'}`}>
        {value}
      </p>
    </div>
  );

  if (isLink && href) {
    return <a href={href} target="_blank" rel="noreferrer" className="block">{content}</a>;
  }
  return content;
}
