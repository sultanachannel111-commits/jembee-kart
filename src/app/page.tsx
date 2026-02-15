"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      
      <h1 className="text-4xl font-bold mb-4">
        JEMBEE STORE 🛍️
      </h1>

      <p className="mb-6 text-gray-600">
        Premium WhatsApp Based Store
      </p>

      <Link
        href="/products/1"
        className="bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        View Product
      </Link>

    </div>
  );
}
