"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck,
  CheckCircle2, XCircle, Loader2, Sparkles
} from "lucide-react";
import Link from "next/link";

type Mode = "login" | "register";

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    capitalize: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  score = Object.values(checks).filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  return { score, checks, label: labels[score] || "", color: colors[score] || "" };
};

export default function AccountPage() {
  const { user, isLoaded, login, register, isLoggingIn } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const pwStrength = getPasswordStrength(form.password);

  // If already logged in, redirect to account dashboard
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/account/dashboard");
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) return setError("Full name is required.");
        await register(form.name, form.email, form.password);
      }
      router.push("/account/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  if (!isLoaded || (isLoaded && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex w-[45%] bg-[#111111] flex-col justify-between p-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 blur-[100px] rounded-full -ml-16 -mb-16" />

        <Link href="/" className="relative z-10">
          <span className="text-3xl  text-white tracking-tighter">
            Amol<span className="text-orange-500">Graphics</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-orange-500 rounded-full" />
              <span className="text-[12px]  text-orange-500 capitalize tracking-[0.5em]">Member Portal</span>
            </div>
            <h1 className="text-5xl  text-white leading-[0.9] tracking-tighter capitalize italic">
              Your<br /><span className="text-orange-500 not-italic">Studio.</span>
            </h1>
            <p className="text-base text-slate-400 font-medium max-w-xs leading-relaxed capitalize tracking-wider">
              Track orders, manage designs, and unlock exclusive member access.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Track all your orders in real-time",
              "Save your custom design templates",
              "Get exclusive member discounts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-orange-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 capitalize tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px]  capitalize tracking-widest">256-Bit Encrypted · httpOnly Session · Zero Data Leakage</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-10">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-block mb-2">
            <span className="text-2xl  text-[#111111] tracking-tighter">
              Amol<span className="text-orange-500">Graphics</span>
            </span>
          </Link>

          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-4xl  text-[#111111] tracking-tighter capitalize">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-[11px] font-medium text-slate-400 capitalize tracking-widest">
              {mode === "login" ? "Welcome back. Enter your credentials." : "Join thousands of happy customers."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1.5">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-3.5 rounded-xl text-[12px]  capitalize tracking-widest transition-all ${
                  mode === m
                    ? "bg-white text-[#111111] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <FormField
                icon={<User size={16} />}
                label="Full Name"
                type="text"
                placeholder="Amol Sharma"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
            )}

            <FormField
              icon={<Mail size={16} />}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              required
            />

            <div className="space-y-2">
              <div className="relative">
                <FormField
                  icon={<Lock size={16} />}
                  label="Password"
                  type={showPw ? "text" : "password"}
                  placeholder={mode === "register" ? "Min. 8 chars, 1 capitalize, 1 number" : "••••••••"}
                  value={form.password}
                  onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  required
                  rightSlot={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-300 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>

              {/* Password strength meter — only in register mode */}
              {mode === "register" && form.password && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{ backgroundColor: i <= pwStrength.score ? pwStrength.color : "#e2e8f0" }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]  capitalize tracking-widest" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                    <div className="flex gap-3">
                      {Object.entries(pwStrength.checks).map(([key, ok]) => (
                        <div key={key} className="flex items-center gap-1">
                          {ok
                            ? <CheckCircle2 size={10} className="text-green-500" />
                            : <XCircle size={10} className="text-slate-300" />
                          }
                          <span className={`text-[12px] font-medium capitalize ${ok ? "text-green-500" : "text-slate-300"}`}>
                            {key === "length" ? "8+" : key === "capitalize" ? "A-Z" : key === "number" ? "0-9" : "#@!"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in duration-300">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-[11px] font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 bg-[#111111] text-white rounded-2xl flex items-center justify-center gap-3  text-[11px] capitalize tracking-[0.3em] hover:bg-orange-500 transition-all shadow-2xl shadow-black/10 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Access Account" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] font-medium text-slate-300 capitalize tracking-widest leading-relaxed">
            Your session is secured with an encrypted httpOnly cookie.{" "}
            <br />No passwords are ever stored in plain text.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormField({
  icon, label, type, placeholder, value, onChange, required, rightSlot
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-2 group">
      <label className="text-[11px]  text-slate-400 capitalize tracking-[0.3em] ml-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-5 text-slate-300 group-focus-within:text-orange-500 transition-colors pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
          className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-12 text-[12px] font-medium text-[#111111] placeholder:text-slate-200 outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
        />
        {rightSlot && (
          <div className="absolute right-5">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}
