import type { Metadata } from "next";
import { Montserrat, Comfortaa } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
    const settings = await res.json();
    
    // Resolve base branding URL
    const baseUrl = API_URL.replace('/api', '');
    const logoRel = settings?.logo?.startsWith('/') ? settings.logo : `/${settings.logo}`;
    const logoUrl = settings?.logo ? (settings.logo.startsWith('http') ? settings.logo : `${baseUrl}${logoRel}`) : '/favicon.ico';

    return {
      title: settings?.storeName || "Amol Graphics",
      description: settings?.description || "Professional product personalization and branding solutions.",
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
    };
  } catch (error) {
    return {
      title: "Amol Graphics | Personalized Prints",
      description: "High-fidelity product personalization and branding solutions.",
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import PrintshoppyHeader from "@/components/ui/PrintshoppyHeader";
import PrintshoppyFooter from "@/components/ui/PrintshoppyFooter";
import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  let categories = [];
  try {
     const [settingsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/settings`, { cache: 'no-store' }),
        fetch(`${API_URL}/categories`, { cache: 'no-store' })
     ]);
     if (settingsRes.ok) settings = await settingsRes.json();
     if (categoriesRes.ok) categories = await categoriesRes.json();
  } catch(e) {
     console.error("Failed to fetch global layout data", e);
  }

  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${comfortaa.variable} antialiased font-sans flex flex-col min-h-screen bg-gray-50`}>
        <UserProvider>
          <CartProvider>
            <PrintshoppyHeader settings={settings} categories={categories} />
            <main className="flex-grow">
               {children}
            </main>
            <PrintshoppyFooter settings={settings} />
            <CartDrawer />
            <WhatsAppWidget />
          </CartProvider>
        </UserProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
