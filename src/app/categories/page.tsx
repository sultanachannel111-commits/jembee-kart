"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MenPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSort, setShowSort] = useState(false);
  const [sortType, setSortType] = useState("Latest");
  const [maxPrice, setMaxPrice] = useState("");

  /* 🔥 FETCH MEN PRODUCTS */
  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(
        collection(db, "products"),
        where("category", "==", "Men")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
      setFiltered(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  /* 🔥 APPLY FILTER + SORT */
  useEffect(() => {
    let temp = [...products];

    if (maxPrice) {
      temp = temp.filter(
        (p) => p.price <= Number(maxPrice)
      );
    }

    if (sortType === "Price Low → High") {
      temp.sort((a, b) => a.price - b.price);
    }

    if (sortType === "Price High → Low") {
      temp.sort((a, b) => b.price - a.price);
    }

    if (sortType === "Latest") {
      temp.sort(
        (a, b) =>
          b.createdAt?.seconds -
          a.createdAt?.seconds
      );
    }

    setFiltered(temp);
  }, [sortType, maxPrice, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      {/* 🔥 TITLE */}
      <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        Men
      </h1>

      {/* 🔥 FILTER BAR */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowSort(true)}
          className="flex-1 bg-white/70 backdrop-blur-lg p-3 rounded-xl shadow font-medium"
        >
          {sortType} ▼
        </button>

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(e.target.value)
          }
          className="flex-1 bg-white/70 backdrop-blur-lg p-3 rounded-xl shadow outline-none"
        />
      </div>

      {/* 🔥 PRODUCTS GRID */}
      <div className="grid grid-cols-2 gap-6">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <img
              src={product.image}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h2 className="font-semibold text-lg">
                {product.name}
              </h2>

              <p className="text-pink-600 font-bold mt-2">
                ₹{product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 PREMIUM SORT BOTTOM SHEET */}
      {showSort && (
        <div
          className="fixed inset-0 bg-black/30 z-50"
          onClick={() => setShowSort(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-2xl rounded-t-3xl shadow-2xl p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Sort By
            </h2>

            {[
              "Latest",
              "Price Low → High",
              "Price High → Low",
            ].map((option) => (
              <div
                key={option}
                onClick={() => {
                  setSortType(option);
                  setShowSort(false);
                }}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-white/60 transition cursor-pointer"
              >
                <span className="text-lg font-medium text-gray-700">
                  {option}
                </span>

                <div className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  {sortType === option && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
