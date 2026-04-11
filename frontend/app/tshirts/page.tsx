import React from "react";
import Link from "next/link";

interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
}

const tshirts: SimpleProduct[] = [
  {
    id: "tshirt",
    name: "Premium Cotton Unisex T-Shirt - White",
    price: 499,
    mrp: 899,
    image: "/mockups/tshirt.png",
    rating: 4.9,
    reviews: 2150,
    badge: "Most Popular"
  },
  {
    id: "tshirt_black",
    name: "Classic Round Neck T-Shirt - Black",
    price: 549,
    mrp: 999,
    image: "/mockups/tshirt.png", // Use white as placeholder or update image
    rating: 4.8,
    reviews: 1420,
    badge: "New Arrival"
  }
];

export default function TShirtsPage() {
  return (
    <div className="min-h-screen bg-white">
       <div className="bg-orange-600 text-white py-2 text-center text-[12px]  capitalize tracking-[0.2em]">
          Special Offer: Buy 2 Get 1 Free on all Custom T-shirts
       </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-base font-medium text-gray-400 capitalize tracking-widest mb-4">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <span className="text-orange-600">Custom T-Shirts</span>
          </div>
          <h1 className="text-5xl  text-gray-900 mb-6 tracking-tighter">
            Custom <span className="text-orange-600">T-Shirt Printing</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Create high-quality custom t-shirts with your photos, designs, and text. Premium 100% cotton fabric.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
          {tshirts.map((p) => (
            <div key={p.id} className="border p-4 rounded-xl">
               <img src={p.image} alt={p.name} className="w-full h-auto mb-4" />
               <h3 className="font-medium text-gray-900">{p.name}</h3>
               <p className="text-gray-500">₹{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
