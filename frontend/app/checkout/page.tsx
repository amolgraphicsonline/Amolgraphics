"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, CreditCard, CheckCircle2, ChevronLeft, ChevronRight,
  Truck, Loader2, MapPin, Phone, User, Mail, ShoppingCart, Image as ImageIcon
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry",
];

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');

  const resolve = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pincode: "",
    city: "",
    state: "Maharashtra",
    address: "",
    landmark: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then(r => r.json())
      .then(data => setStoreSettings(data))
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  const taxRate = storeSettings?.taxRate ?? 18.0;
  const taxInclusive = storeSettings?.taxInclusive !== false;
  const shipping = storeSettings?.defaultShippingFee ?? 0;
  
  const discountAmount = selectedCoupon
    ? (selectedCoupon.discountType === 'PERCENT'
        ? (total * selectedCoupon.discountValue / 100)
        : selectedCoupon.discountValue)
    : 0;

  const totalPrintingCharge = cart.reduce((sum, item) => sum + ((item.printingCharge || 0) * item.quantity), 0);

  const taxableAmount = Math.max(0, total - discountAmount);
  let taxAmount = 0;
  let finalTotal = 0;

  if (taxInclusive) {
    taxAmount = Math.round(taxableAmount - (taxableAmount / (1 + taxRate / 100)));
    finalTotal = taxableAmount + shipping;
  } else {
    taxAmount = Math.round(taxableAmount * (taxRate / 100));
    finalTotal = taxableAmount + taxAmount + shipping;
  }

  useEffect(() => {
    if (step !== "processing") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Payment is being processed. Leaving now may cause issues.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_API_URL) return alert("API URL not configured");
    
    setIsSubmitting(true);
    setStep("processing");

    try {
      const orderData = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        subTotal: total,
        printingCharge: totalPrintingCharge,
        discountAmount: discountAmount,
        couponId: selectedCoupon?.id || null,
        taxAmount: taxAmount, 
        shippingCost: shipping,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          variantId: null,
          quantity: item.quantity,
          price: item.price,
          designJson: item.designJson,
          previewImage: item.image
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const orderResponse = await res.json();
      if (!res.ok) throw new Error(orderResponse.message || "Failed to create order");

      if (paymentMethod === "RAZORPAY") {
        if (!orderResponse.razorpayOrderId || orderResponse.razorpayOrderId.startsWith("mrzp_")) {
          setStep("processing");
          setTimeout(() => {
            clearCart();
            router.replace(`/order-success/${orderResponse.id}`);
          }, 2000);
          return;
        }

        const options = {
          key: orderResponse.razorpayKey,
          amount: orderResponse.totalAmount * 100,
          currency: "INR",
          name: storeSettings?.storeName || "Store",
          description: `Order #${orderResponse.id.slice(-6).toUpperCase()}`,
          order_id: orderResponse.razorpayOrderId,
          handler: async (response: any) => {
            try {
              setStep("processing");
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderResponse.id
                })
              });
              clearCart();
              router.replace(`/order-success/${orderResponse.id}`);
            } catch (err) {
              alert("Verification failed.");
              setStep("form");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: "#EE4A4A" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        router.replace(`/order-success/${orderResponse.id}`);
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && step !== "success" && !isSubmitting && step !== "processing") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white text-center p-8 border-t border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <ShoppingCart size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase mb-2">Cart is Empty</h1>
        <p className="text-gray-500 mb-6 font-medium">Looks like you haven't made your choice yet.</p>
        <button 
          onClick={() => router.push("/shop")}
          className="px-8 py-3 bg-red-500 text-white font-bold rounded shadow-sm hover:bg-red-600 transition-colors uppercase text-sm"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans border-t border-gray-100">

      {step === "success" ? (
        <SuccessView />
      ) : (
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8 pb-3 border-b-2 border-red-500 inline-block">Checkout Securely</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Form Area */}
            <div className="lg:col-span-8 space-y-8">
               <form id="checkout-form" onSubmit={handleCheckout} className="bg-white border border-gray-200 rounded p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 uppercase mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                     <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                     Shipping Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                     <AdminInput icon={<User />} label="Full Name" name="fullName" required value={formData.fullName} onChange={handleInput} />
                     <AdminInput icon={<Mail />} label="Email Address" name="email" type="email" required value={formData.email} onChange={handleInput} />
                     <AdminInput icon={<Phone />} label="Mobile Number" name="phone" type="tel" required value={formData.phone} onChange={handleInput} />
                     <AdminInput icon={<MapPin />} label="Pincode" name="pincode" required value={formData.pincode} onChange={handleInput} />
                     <AdminInput icon={<ImageIcon />} label="City" name="city" required value={formData.city} onChange={handleInput} />
                     
                     <div className="space-y-1 group">
                        <label className="text-[11px] font-bold text-gray-600 uppercase">State</label>
                        <div className="relative">
                           <select 
                             name="state" 
                             value={formData.state} 
                             onChange={handleInput}
                             className="w-full h-11 bg-gray-50 border border-gray-300 rounded px-3 text-sm font-medium text-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow appearance-none"
                           >
                              {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                           </select>
                           <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                     </div>
                  </div>

                  <AdminInput label="Full Address" name="address" required value={formData.address} onChange={handleInput} isTextArea />

                  <h2 className="text-lg font-bold text-gray-800 uppercase mb-6 mt-10 flex items-center gap-2 border-b border-gray-100 pb-2">
                     <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                     Payment Method
                  </h2>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div 
                      onClick={() => setPaymentMethod("RAZORPAY")}
                      className={`p-4 bg-white border-2 ${paymentMethod === "RAZORPAY" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"} rounded flex items-center gap-4 cursor-pointer transition-colors`}
                     >
                        <div className={`w-8 h-8 shrink-0 ${paymentMethod === "RAZORPAY" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"} rounded flex items-center justify-center`}>
                           <CreditCard size={16} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-gray-800 uppercase">Pay Online Form</p>
                           <p className="text-xs text-gray-500 italic">UPI / Wallets / Cards</p>
                        </div>
                        {paymentMethod === "RAZORPAY" && <CheckCircle2 size={20} className="text-red-500" />}
                     </div>

                     <div 
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-4 bg-white border-2 ${paymentMethod === "COD" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"} rounded flex items-center gap-4 cursor-pointer transition-colors`}
                     >
                        <div className={`w-8 h-8 shrink-0 ${paymentMethod === "COD" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"} rounded flex items-center justify-center`}>
                           <Truck size={16} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-gray-800 uppercase">Cash on Delivery</p>
                           <p className="text-xs text-gray-500 italic">Pay cash at door</p>
                        </div>
                        {paymentMethod === "COD" && <CheckCircle2 size={20} className="text-red-500" />}
                     </div>
                  </div>
               </form>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-4">
               <div className="bg-white border border-gray-200 rounded shadow-sm p-6 lg:sticky lg:top-24">
                  <h3 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-100 pb-3 mb-4">Order Summary</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-gray-100 scrollbar-hide">
                     {cart.map(item => (
                       <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                          <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                             {item.image ? (
                               <img src={resolve(item.image)} className="w-full h-full object-contain" alt={item.name} />
                             ) : (
                               <span className="text-[8px] text-gray-400 font-bold uppercase text-center leading-tight">No<br/>Preview</span>
                             )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                             <h4 className="text-sm font-bold text-gray-800 uppercase truncate">{item.name}</h4>
                             <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                             <p className="text-sm font-bold text-red-500">₹{item.price * item.quantity}/-</p>
                          </div>
                       </div>
                     ))}
                  </div>
  
                  <div className="space-y-3 pt-6 mt-4 border-t border-gray-200 text-sm">
                     <div className="flex justify-between items-center text-gray-600 font-bold uppercase">
                        <span>Cart Subtotal</span>
                        <span>₹{total}</span>
                     </div>

                     {totalPrintingCharge > 0 && (
                        <div className="flex justify-between items-center text-gray-600 font-bold uppercase">
                           <span>Customization Fees</span>
                           <span>₹{totalPrintingCharge}</span>
                        </div>
                     )}

                     {selectedCoupon && (
                        <div className="flex justify-between items-center text-green-600 font-bold uppercase">
                           <span>Discount</span>
                           <span>-₹{discountAmount}</span>
                        </div>
                     )}

                     <div className="flex justify-between items-center text-gray-600 font-bold uppercase">
                        <span>Shipping Delivery</span>
                        <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                     </div>
                      
                     <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end">
                        <span className="text-xl text-gray-800 font-black uppercase">Grand Total</span>
                        <span className="text-2xl text-red-500 font-black tracking-tight">₹{finalTotal}/-</span>
                     </div>
                  </div>
  
                  <button 
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 w-full h-12 bg-red-500 text-white font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-600 shadow-sm transition-colors disabled:opacity-50"
                  >
                     {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Place Order Now"}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase">
                     <ShieldCheck size={14} /> 100% Secure Checkout
                  </div>
               </div>
            </div>
          </div>
        </main>
      )}

      {/* Processing State Overlay */}
      {step === "processing" && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur flex flex-col items-center justify-center text-center p-8">
           <Loader2 size={48} className="text-red-500 animate-spin mb-4" />
           <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Processing Order</h3>
           <p className="text-gray-500 font-medium">Please do not refresh or close this window.</p>
        </div>
      )}
    </div>
  );
}

function AdminInput({ label, isTextArea, icon, ...props }: any) {
  return (
    <div className="space-y-1 group">
       <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 block">{label}</label>
       <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
               {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
            </div>
          )}
          {isTextArea ? (
            <textarea 
              {...props}
              rows={3}
              className="w-full bg-gray-50 border border-gray-300 rounded p-3 text-sm font-medium text-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow resize-none"
            />
          ) : (
            <input 
              {...props}
              className={`w-full h-11 bg-gray-50 border border-gray-300 rounded ${icon ? 'pl-9' : 'px-3'} pr-3 text-sm font-medium text-gray-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow`}
            />
          )}
       </div>
    </div>
  );
}

function SuccessView() {
  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
       <div className="w-24 h-24 mx-auto bg-green-50 rounded-full border border-green-100 flex items-center justify-center text-green-500 mb-6 shadow-sm">
          <CheckCircle2 size={48} />
       </div>
       
       <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-800 uppercase">Order Confirmed</h2>
          <p className="text-gray-500 font-medium text-sm">Thank you! Your custom memories are being processed.</p>
       </div>

       <div className="p-6 bg-white border border-gray-200 rounded shadow-sm flex justify-around mt-8">
           <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Number</p>
              <p className="text-lg font-black text-gray-800">#{Math.floor(100000 + Math.random() * 900000)}</p>
           </div>
       </div>

       <div className="pt-8 text-sm font-medium text-gray-500 group">
          <Link href="/shop" className="text-red-500 hover:text-red-600 transition-colors border-b-2 border-red-500 pb-1">
             Continue Shopping
          </Link>
       </div>
    </main>
  );
}
