"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {

  const banners = [
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      title: "Mega Sneaker Sale 🔥",
      subtitle: "Up to 50% OFF on Premium Collection",
    },
    {
      image: "https://images.unsplash.com/photo-1528701800489-20be3c2ea4c4",
      title: "New Arrivals 🚀",
      subtitle: "Latest Trending Styles Available",
    },
  ];

  const categories = [
    { name: "Sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1520975928316-56d32e6f3d8d" },
    { name: "Watches", image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1585386959984-a41552231658" },
  ];

  const products = [
    {
      name: "Premium Sneakers",
      price: "₹999",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    },
    {
      name: "Luxury Watch",
      price: "₹1999",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
    },
    {
      name: "Stylish Hoodie",
      price: "₹799",
      image: "https://images.unsplash.com/photo-1520975928316-56d32e6f3d8d",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">

      {/* STICKY OFFER BAR */}
      <div className="bg-green-600 text-white text-center py-2 text-sm font-medium">
        🎉 Free Shipping on All Orders | Limited Time Offer!
      </div>

      {/* BANNER SLIDER */}
      <div className="relative w-full h-[280px] md:h-[420px] overflow-hidden">
        <img
          src={banners[current].image}
          alt="banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-2xl md:text-5xl font-bold mb-3">
            {banners[current].title}
          </h1>
          <p className="mb-5">{banners[current].subtitle}</p>
          <Link
            href="/orders"
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-semibold"
          >
            Shop Now 🚀
          </Link>
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <div className="max-w-6xl mx-auto py-14 px-6">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition duration-300"
            >
              <img
                src={cat.image}
                className="h-32 w-full object-cover"
                alt=""
              />
              <div className="p-4 text-center font-semibold">
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="max-w-6xl mx-auto pb-16 px-6">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300"
            >
              <img
                src={product.image}
                className="h-56 w-full object-cover"
                alt=""
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {product.name}
                </h3>
                <p className="text-green-600 font-bold mb-4">
                  {product.price}
                </p>

                <a
                  href="https://wa.me/917061369212"
                  target="_blank"
                  className="block text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                >
                  Order on WhatsApp 🚀
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROFESSIONAL FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">
              JEMBEE STORE
            </h3>
            <p>Premium WhatsApp Based Shopping Experience.</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/orders">Orders</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p>WhatsApp: 7061369212</p>
            <p>Email: support@jembee.com</p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          © 2026 JEMBEE STORE. All rights reserved.
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/917061369212"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-xl"
      >
        💬 Chat
      </a>

    </div>
  );
}
