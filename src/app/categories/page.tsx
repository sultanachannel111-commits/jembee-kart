"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoriesPage() {

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 SLUG CLEAN FUNCTION (MAIN FIX)
  const makeSlug = (text: string) =>
    text
      ?.toLowerCase()
      .replace(/&/g, "and")   // FIX: & → and
      .replace(/[^\w\s]/g, "") // remove special chars
      .replace(/\s+/g, "-");   // space → dash

  useEffect(() => {

    const fetchCategories = async () => {
      try {

        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔥 CATEGORY MAP (REAL CATEGORY FIELD USE)
        const categoryMap: any = {};

        data.forEach((product: any) => {
          if (!product.category) return;

          const cat = product.category.trim();

          if (!categoryMap[cat]) {
            categoryMap[cat] = 1;
          } else {
            categoryMap[cat]++;
          }
        });

        // 🔥 FINAL CATEGORY ARRAY
        const finalCategories = Object.keys(categoryMap).map((key) => ({
          name: key,
          slug: makeSlug(key), // 🔥 CLEAN SLUG
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

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      {/* 🔥 TITLE */}
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        All Categories
      </h1>

      {/* ❌ EMPTY */}
      {categories.length === 0 ? (
        <div className="text-gray-500 text-center">
          No categories found
        </div>
      ) : (

        /* ✅ GRID */
        <div className="grid grid-cols-2 gap-5">

          {categories.map((cat) => (

            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-md hover:shadow-2xl transition active:scale-95 flex flex-col items-center justify-center"
            >

              {/* ICON */}
              <div className="text-3xl mb-2">
                📦
              </div>

              {/* NAME */}
              <span className="text-lg font-semibold text-gray-800 text-center">
                {cat.name}
              </span>

              {/* COUNT */}
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
