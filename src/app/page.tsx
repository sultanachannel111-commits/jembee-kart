"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";

export default function HomePage() {
  const banners = [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    "Mobiles",
    "Fashion",
    "Electronics",
    "Beauty",
    "Home",
    "Shoes",
    "Watches",
    "Grocery",
    "Appliances",
    "Accessories",
  ];

  const products = [
    {
      id: 1,
      name: "Premium Sneakers",
      price: 999,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    },
    {
      id: 2,
      name: "Luxury Watch",
      price: 1499,
      image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    },
    {
      id: 3,
      name: "Wireless Headphones",
      price: 799,
      image: "https://images.unsplash.com/photo-1518441902110-0b8a36b7d9d6",
    },
    {
      id: 4,
      name: "Trendy Jacket",
      price: 1999,
      image: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
    },
  ];

  const orderOnWhatsApp = (product: any) => {
    const message = `🛍️ *JEMBEE KART - New Order*  

Product: ${product.name}
Price: ₹${product.price}

Please confirm availability.`;

    window.open(
      `https://wa.me/917061369212?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-yellow-50">

      {/* 🔶 Top Offer Bar */}
      <div className="bg-yellow-400 text-center py-2 text-sm font-semibold">
        ⚡ Free Delivery | WhatsApp Fast Ordering
      </div>

      {/* 🔷 Premium Header */}
      <header className="bg-yellow-400 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-900">
            JEMBEE KART
          </h1>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search products..."
              className="hidden md:block px-3 py-1 rounded"
            />
            <ShoppingCart className="text-blue-900 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* 🎯 Auto Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg transition-all duration-500">
          <Image
            src={banners[currentBanner]}
            alt="banner"
            fill
            className="object-cover transition-opacity duration-700"
          />
        </div>
      </div>

      {/* 🗂 Categories */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-6 overflow-x-auto pb-2">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="min-w-[90px] bg-white shadow-md rounded-xl p-3 text-center hover:scale-105 transition cursor-pointer"
            >
              <div className="text-2xl">📦</div>
              <p className="text-sm mt-2">{cat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🛍 Featured Products */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-xl font-bold mb-6 text-blue-900">
          Trending Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 p-4"
            >
              <div className="relative w-full h-40">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <h3 className="mt-3 font-semibold text-sm">
                {product.name}
              </h3>

              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-gray-600">4.6</span>
              </div>

              <p className="text-blue-600 font-bold mt-2">
                ₹{product.price}
              </p>

              <button
                onClick={() => orderOnWhatsApp(product)}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
              >
                Order on WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 📱 Floating WhatsApp */}
      <a
        href="https://wa.me/917061369212"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        💬
      </a>

      {/* 🔻 Premium Footer */}
      <footer className="mt-16 bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          © 2026 JEMBEE KART | WhatsApp Shopping Experience
        </div>
      </footer>
    </div>
  );
}
