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

        const categoryMap: any = {};

        snap.forEach(doc => {
          const data: any = doc.data();

          if (!data.category) return;

          if (!categoryMap[data.category]) {
            categoryMap[data.category] = 1;
          } else {
            categoryMap[data.category]++;
          }
        });

        const finalCategories = Object.keys(categoryMap).map((key) => ({
          name: key,
          slug: key.toLowerCase().replace(/\s/g, "-"),
          count: categoryMap[key],
        }));

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
