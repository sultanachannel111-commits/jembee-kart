"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  const whatsappNumber = "91706136922"; // 91 + number (no + sign)

  const handleWhatsAppOrder = (product: any) => {
    const message = `🛍 *New Order Request*

Product: ${product.name}
Price: ₹${product.price}
Product ID: ${product.id}

Please confirm availability.`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const products = [
    {
      id: "PRD001",
      name: "Premium Sneakers",
      price: 999,
      image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    },
    {
      id: "PRD002",
      name: "Wireless Headphones",
      price: 1499,
      image:
        "https://images.unsplash.com/photo-1580894894513-541e068a3e2b",
    },
    {
      id: "PRD003",
      name: "Smart Watch",
      price: 1999,
      image:
        "https://images.unsplash.com/photo-1518441987054-6b2c8c5b4c90",
    },
    {
      id: "PRD004",
      name: "Bluetooth Speaker",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* 🔵 HEADER SECTION */}
      <div className="bg-blue-600 p-4 text-white">
        <h1 className="text-2xl font-bold">Jembee Kart</h1>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full p-3 rounded-lg text-black"
          />
        </div>
      </div>

      {/* 🗂 CATEGORY ROW */}
      <div className="flex gap-6 overflow-x-auto p-4 bg-white shadow-sm">
        {["Fashion", "Mobiles", "Beauty", "Electronics", "Home"].map(
          (cat) => (
            <div key={cat} className="text-center min-w-[80px]">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                🛍
              </div>
              <p className="text-sm mt-2">{cat}</p>
            </div>
          )
        )}
      </div>

      {/* 🎯 HERO BANNER */}
      <div className="p-4">
        <div className="relative w-full h-44 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db"
            alt="banner"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 🛍 PRODUCT GRID */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-3"
          >
            <div className="relative w-full h-32">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded"
              />
            </div>

            <p className="text-sm font-semibold mt-2">
              {product.name}
            </p>

            <p className="text-green-600 font-bold text-lg">
              ₹{product.price}
            </p>

            <Button
              className="w-full mt-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleWhatsAppOrder(product)}
            >
              Order on WhatsApp
            </Button>
          </div>
        ))}
      </div>

      {/* 📱 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => router.push("/")}>🏠 Home</button>
        <button onClick={() => router.push("/orders")}>
          📦 My Orders
        </button>
        <button
          onClick={() =>
            window.open(
              `https://wa.me/${whatsappNumber}`,
              "_blank"
            )
          }
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
