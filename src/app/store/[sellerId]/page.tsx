"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function StorePage() {

  const params = useParams();
  const sellerId = String(params?.sellerId || "");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD PRODUCTS
  useEffect(() => {

    const loadProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const arr: any[] = [];

        snap.forEach((doc) => {
          arr.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setProducts(arr);

        // 🔥 Affiliate save
        if (typeof window !== "undefined") {
          localStorage.setItem("refSeller", sellerId);
        }

      } catch (err) {
        console.log("❌ PRODUCT ERROR:", err);
      }

      setLoading(false);
    };

    loadProducts();

  }, [sellerId]);


  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/store/${sellerId}`
      : "";


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      {/* HEADER */}
      <div className="p-5 rounded-2xl mb-5 text-center shadow bg-white/40 backdrop-blur-lg">
        <h1 className="text-2xl font-bold">🛍 Seller Store</h1>
        <p className="text-sm text-gray-600 mt-1">
          Best products for you 🔥
        </p>
      </div>


      {/* SHARE STORE */}
      <div className="p-4 rounded-2xl mb-5 shadow bg-gradient-to-r from-green-400 to-emerald-500 text-white">

        <h2 className="font-bold text-lg">🚀 Share & Earn</h2>

        <p className="text-sm opacity-90">
          Share this store & earn commission 💰
        </p>

        <div className="flex gap-2 mt-3">

          <input
            value={shareLink}
            readOnly
            className="flex-1 p-2 rounded text-black text-sm"
          />

          <button
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
              alert("Link copied ✅");
            }}
            className="bg-white text-black px-3 rounded"
          >
            Copy
          </button>

        </div>

        <button
          onClick={() => {
            const text = `🛍 Shop amazing products 🔥\n\n${shareLink}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
          }}
          className="w-full mt-3 bg-white text-green-600 py-2 rounded-xl font-semibold"
        >
          📲 Share Store
        </button>

      </div>


      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      )}


      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <p className="text-center text-red-500">
          No products found ❌
        </p>
      )}


      {/* PRODUCTS */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((p) => {

          const basePrice =
            p?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            p.price ||
            0;

          // ❌ DISCOUNT REMOVED
          const finalPrice = basePrice;

          const image =
            p?.variations?.[0]?.images?.main ||
            p.image ||
            "/no-image.png";

          return (
            <div
              key={p.id}
              className="bg-white p-3 rounded-2xl shadow hover:shadow-xl transition"
            >

              {/* IMAGE (NO BLINK FIXED) */}
              <img
                src={image}
                className="h-32 w-full object-cover rounded-xl"
              />

              {/* NAME */}
              <p className="font-semibold mt-2 text-sm line-clamp-2">
                {p.name}
              </p>

              {/* PRICE */}
              <p className="text-green-600 font-bold mt-1">
                ₹{finalPrice}
              </p>

              {/* SHARE */}
              <button
                onClick={() => {

                  const link = `${window.location.origin}/product/${p.id}?ref=${sellerId}`;

                  navigator.share?.({
                    title: p.name,
                    url: link,
                  });

                }}
                className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
              >
                Share & Earn 💰
              </button>

              {/* VIEW */}
              <button
                onClick={() => window.location.href = `/product/${p.id}`}
                className="mt-2 w-full border py-1 rounded"
              >
                View
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
}
