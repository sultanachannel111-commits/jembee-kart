"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">
            JEMBEE STORE
          </h1>

          <Link
            href="/orders"
            className="text-sm font-semibold text-gray-700"
          >
            Track Order
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto p-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Premium WhatsApp Store
        </h2>

        <p className="text-gray-600 mb-6">
          Genuine Verified Products • Fast Delivery • Easy WhatsApp Order
        </p>

        <Link
          href="/products/1"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
        >
          Shop Now on WhatsApp
        </Link>
      </section>

      {/* PRODUCT SECTION */}
      <section className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-105 transition">
          <div className="relative h-64 w-full">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
              alt="T-Shirt"
              fill
              className="object-cover rounded-xl"
            />
          </div>

          <h3 className="text-xl font-semibold mt-4">
            Premium Cotton T-Shirt
          </h3>

          <p className="text-green-600 font-bold text-lg mt-2">
            ₹499
          </p>

          <a
            href="https://wa.me/91706136922?text=Hello%20I%20want%20to%20order%20Premium%20Cotton%20T-Shirt%20₹499"
            target="_blank"
            className="block mt-4 bg-green-600 text-white text-center py-2 rounded-xl hover:bg-green-700 transition"
          >
            Order on WhatsApp
          </a>
        </div>

      </section>

    </div>
  );
}
