"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔥 AUTO CATEGORY FROM PRODUCT NAME
        const categoryMap: any = {};

        data.forEach((product) => {
          if (!product.name) return;

          const words = product.name.toLowerCase().split(" ");

          words.forEach((word: string) => {
            if (!categoryMap[word]) {
              categoryMap[word] = 1;
            } else {
              categoryMap[word]++;
            }
          });
        });

        // Convert object → array
        const finalCategories = Object.keys(categoryMap)
          .filter((key) => categoryMap[key] >= 1) // minimum 1 product
          .map((key) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            slug: key,
            count: categoryMap[key],
          }))
          .slice(0, 8); // limit to 8 categories

        setCategories(finalCategories);
      } catch (err) {
        console.log("Category error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        All Categories
      </h1>

      {categories.length === 0 ? (
        <div className="text-gray-500 text-center">
          No categories found
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-semibold text-gray-800">
                {cat.name}
              </span>

              <span className="text-sm text-gray-500 mt-1">
                {cat.count} Products
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
