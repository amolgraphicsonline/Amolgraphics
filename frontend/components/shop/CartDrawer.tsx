"use client";

import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, total, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300",
          (isOpen && pathname !== '/cart') ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50 z-[101] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col font-sans",
          (isOpen && pathname !== '/cart') ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <header className="px-4 py-4 border-b border-gray-200 flex items-center justify-between bg-white text-gray-800 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold tracking-tight uppercase">Shopping Cart</h2>
            <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{cart.length}</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">Your Cart is Empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded shadow-sm text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded border border-gray-200 p-3 shadow-sm flex flex-col gap-3 relative"
              >
                {/* Product images row */}
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith('http') ? item.image : (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '') + (item.image.startsWith('/') ? item.image : '/' + item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase text-center leading-tight">No<br/>Preview</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight uppercase mb-1">{item.name}</h4>
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      {item.size && (
                        <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                      )}
                    </div>
                    <p className="text-red-500 font-bold text-sm mt-2">₹{item.price}/-</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden h-8">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-800 border-x border-gray-300 bg-white leading-8">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <footer className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10 space-y-4">
            <div className="flex justify-between items-center text-gray-800">
              <span className="text-sm font-bold uppercase">Subtotal</span>
              <span className="text-lg font-black text-red-500">₹{total}/-</span>
            </div>
            <p className="text-xs text-gray-500 italic">Shipping & taxes calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-red-500 text-white rounded text-sm font-bold uppercase tracking-wider shadow hover:bg-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Checkout Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </footer>
        )}
      </div>
    </>
  );
};
