"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* 🔵 Top Header */}
      <div className="bg-blue-600 text-white p-3">
        <div className="text-xl font-bold">Jembee Kart</div>

        {/* 🔍 Search Bar */}
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full p-2 rounded-md text-black"
          />
        </div>
      </div>

      {/* 📦 Categories */}
      <div className="bg-white p-3 flex justify-between text-center text-xs font-medium">
        {["Fashion", "Mobiles", "Beauty", "Electronics", "Home"].map((cat) => (
          <div key={cat} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              🛍️
            </div>
            <p className="mt-1">{cat}</p>
          </div>
        ))}
      </div>

      {/* 🎯 Banner Slider */}
      <div className="p-3">
        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow">
          <Image
            src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db"
            alt="banner"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 🛒 Product Grid */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white rounded-xl shadow-sm p-3"
            onClick={() => router.push("/product")}
          >
            <div className="relative w-full h-32">
              <Image
                src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"
                alt="product"
                fill
                className="object-cover rounded"
              />
            </div>

            <p className="text-sm font-semibold mt-2">
              Premium Sneakers
            </p>
            <p className="text-green-600 font-bold">₹999</p>
            <p className="text-xs text-gray-500">Free Delivery</p>
          </div>
        ))}
      </div>

      {/* 📱 Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 shadow-md">
        <button onClick={() => router.push("/")} className="text-blue-600">
          🏠
          <p className="text-xs">Home</p>
        </button>

        <button onClick={() => router.push("/categories")}>
          📂
          <p className="text-xs">Categories</p>
        </button>

        <button onClick={() => router.push("/orders")}>
          👤
          <p className="text-xs">Account</p>
        </button>

        <button onClick={() => router.push("/cart")}>
          🛒
          <p className="text-xs">Cart</p>
        </button>
      </div>
    </div>
  );
}
