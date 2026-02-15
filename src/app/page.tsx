"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">
          JEMBEE STORE
        </h1>
        <p className="text-gray-600 mt-2">
          Premium WhatsApp Based Store
        </p>
      </div>

      {/* Product Card */}
      <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-4">
        <img
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
          className="rounded-xl"
        />

        <h2 className="text-xl font-semibold mt-4">
          Premium White T-Shirt
        </h2>

        <p className="text-green-600 font-bold text-lg mt-1">
          ₹599
        </p>

        <button
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
          onClick={() => {
            const message = `Hello, I want to order:\n\nProduct: Premium White T-Shirt\nPrice: ₹599\n\nPlease confirm availability.`;
            window.open(
              `https://wa.me/91706136922?text=${encodeURIComponent(message)}`,
              "_blank"
            );
          }}
        >
          Order on WhatsApp
        </button>
      </div>

    </div>
  );
}
