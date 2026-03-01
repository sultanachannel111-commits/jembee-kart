"use client";

import Link from "next/link";

export default function CategoriesPage() {
  const categories = [
    { name: "T Shirt", slug: "t-shirt" },
    { name: "Hoodie", slug: "hoodie" },
    { name: "Oversized", slug: "oversized" },
    { name: "Printed", slug: "printed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        All Categories
      </h1>

      <div className="grid grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition flex items-center justify-center text-lg font-semibold text-gray-700"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
