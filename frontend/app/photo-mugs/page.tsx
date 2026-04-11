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

const mugs: SimpleProduct[] = [
  {
    id: "mug",
    name: "Classic White Coffee Mug - 330ml",
    price: 199,
    mrp: 399,
    image: "/mockups/mug.png",
    rating: 4.8,
    reviews: 1240,
    badge: "Best Seller"
  },
  {
    id: "magic_mug",
    name: "Magic Color Changing Mug - Black",
    price: 349,
    mrp: 599,
    image: "/mockups/magic_mug.png",
    rating: 4.9,
    reviews: 856,
    badge: "Trending"
  },
  {
    id: "heart_mug",
    name: "Red Heart Handle Mug - Personalized",
    price: 299,
    mrp: 499,
    image: "/mockups/heart_mug.png",
    rating: 4.7,
    reviews: 432,
    badge: "New"
  },
  {
    id: "patch_mug",
    name: "Patch Mug with Custom Message",
    price: 249,
    mrp: 449,
    image: "/mockups/mug.png",
    rating: 4.6,
    reviews: 120,
  }
];

export default function PhotoMugsPage() {
  return (
    <div className="min-h-screen bg-white">
       {/* Navigation Header snippet - usually would be a component */}
       <div className="bg-gray-900 text-white py-2 text-center text-[12px]  capitalize tracking-[0.2em]">
          Free Delivery on all prepaid orders above ₹499
       </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-base font-medium text-gray-400 capitalize tracking-widest mb-4">
            <a href="/" className="hover:text-orange-600">Home</a>
            <span>/</span>
            <span className="text-orange-600">Photo Mugs</span>
          </div>
          <h1 className="text-5xl  text-gray-900 mb-6 tracking-tighter">
            Personalized <span className="text-orange-600">Photo Mugs</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Choose from our wide range of custom coffee mugs. Perfect for your morning brew or a thoughtful gift.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
          {mugs.map((mug) => (
            <div key={mug.id} className="border p-4 rounded-xl">
               <img src={mug.image} alt={mug.name} loading="lazy" className="w-full h-auto mb-4" />
               <h3 className="font-medium text-gray-900">{mug.name}</h3>
               <p className="text-gray-500">₹{mug.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
