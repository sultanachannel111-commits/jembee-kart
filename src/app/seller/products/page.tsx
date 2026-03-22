"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 PRODUCTS:", data); // debug

        setProducts(data);
      } catch (err) {
        console.log("❌ ERROR:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      {products.length === 0 ? (
        <p>No products found ❌</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p: any) => (
            <div
              key={p.id}
              className="bg-white p-3 rounded-xl shadow"
            >
              <img
                src={p?.variations?.[0]?.images?.main}
                className="h-32 w-full object-cover rounded"
              />

              <p className="text-sm font-semibold mt-2">
                {p.name}
              </p>

              <p className="text-green-600 font-bold">
                ₹
                {p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0}
              </p>

              {/* 🔗 SHARE BUTTON */}
              <button
                onClick={() =>
                  navigator.share?.({
                    title: p.name,
                    url: `${window.location.origin}/product/${p.id}`,
                  })
                }
                className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
              >
                Share
              </button>

              {/* 👉 VIEW */}
              <button
                onClick={() => router.push(`/product/${p.id}`)}
                className="mt-2 w-full border py-1 rounded"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
