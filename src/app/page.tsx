"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const banners = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>

      {/* Offer Bar */}
      <div className="bg-green-600 text-white text-center py-2 font-medium">
        🚚 Free Shipping on All Orders | Limited Time Offer!
      </div>

      {/* Auto Slider Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <img
          src={banners[current]}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Mega Sale 🔥
          </h1>
          <button className="bg-green-500 px-6 py-3 rounded-full">
            Shop Now 🚀
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Sneakers", img: banners[0] },
            { name: "Fashion", img: banners[1] },
            { name: "Watches", img: banners[2] },
            { name: "Accessories", img: banners[1] },
            { name: "Mobiles", img: banners[2] },
            { name: "Laptops", img: banners[0] },
            { name: "Gaming", img: banners[1] },
            { name: "Beauty", img: banners[2] },
          ].map((cat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition"
            >
              <img
                src={cat.img}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 text-center font-semibold">
                {cat.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Featured Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Premium Sneakers", price: "₹999", img: banners[0] },
            { name: "Luxury Watch", price: "₹1999", img: banners[2] },
            { name: "Stylish Hoodie", price: "₹799", img: banners[1] },
            { name: "Gaming Mouse", price: "₹499", img: banners[2] },
            { name: "Smart Phone", price: "₹9999", img: banners[0] },
            { name: "Headphones", price: "₹1299", img: banners[1] },
          ].map((product, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={product.img}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  {product.name}
                </h3>
                <p className="text-green-600 font-bold my-2">
                  {product.price}
                </p>
                <a
                  href="https://wa.me/917061369212"
                  className="block text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                >
                  Order on WhatsApp 🚀
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
