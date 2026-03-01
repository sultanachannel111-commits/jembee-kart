"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔥 NAME BASED FILTER (SAFE)
        const filtered = data.filter((p) =>
          p.name?.toLowerCase().includes(slug.toLowerCase())
        );

        setProducts(filtered);
      } catch (err) {
        console.log("Category fetch error:", err);
      } finally {
        // 🔥 ALWAYS RUNS
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      <h1 className="text-4xl font-extrabold mb-6 capitalize bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        {slug}
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              <img
                src={product.image}
                className="w-full h-48 object-cover"
                alt={product.name}
              />

              <div className="p-4">
                <h2 className="font-semibold text-lg">
                  {product.name}
                </h2>

                <p className="text-pink-600 font-bold mt-2">
                  ₹{product.sellingPrice || product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
