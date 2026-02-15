"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="p-4 space-y-5">

        {/* 🔍 Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search for Products"
            className="w-full p-3 rounded-xl border bg-white shadow-sm"
          />
        </div>

        {/* 🗂 Categories */}
        <div className="flex gap-6 overflow-x-auto pb-2">
          {["Fashion", "Mobiles", "Beauty", "Electronics", "Home"].map((cat) => (
            <div key={cat} className="flex flex-col items-center min-w-[70px]">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center text-xl">
                📦
              </div>
              <p className="text-xs mt-2 text-center">{cat}</p>
            </div>
          ))}
        </div>

        {/* 🎯 Banner Slider */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db"
            alt="banner"
            fill
            className="object-cover"
          />
        </div>

        {/* 🛍 Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow p-3 cursor-pointer"
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

              <p className="text-sm font-semibold mt-2">Product Name</p>
              <p className="text-blue-600 font-bold">₹999</p>
            </div>
          ))}
        </div>

      </div>

      {/* 📱 Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <button onClick={() => router.push("/")}>🏠 Home</button>
        <button onClick={() => router.push("/categories")}>📂 Categories</button>
        <button onClick={() => router.push("/orders")}>👤 Account</button>
        <button onClick={() => router.push("/cart")}>🛒 Cart</button>
      </div>
    </div>
  );
}
