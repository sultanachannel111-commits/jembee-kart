"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1️⃣ Qikink Products
        const res = await fetch("/api/qikink/products");
        const qikinkData = await res.json();

        if (!qikinkData?.data) {
          setLoading(false);
          return;
        }

        // 2️⃣ Firestore Pricing
        const pricingSnap = await getDocs(collection(db, "productPricing"));

        const pricingMap: any = {};
        pricingSnap.forEach((doc) => {
          pricingMap[doc.id] = doc.data().sellingPrice;
        });

        // 3️⃣ Merge Qikink + Firestore
        const mergedProducts = qikinkData.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          image: product.images?.[0],
          basePrice: product.product_price,
          finalPrice:
            pricingMap[product.id] ||
            Number(product.product_price) + 150, // default margin
        }));

        setProducts(mergedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white p-6">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
        JEMBEE 💖
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-xl transition"
          >
            <img
              src={product.image}
              className="h-40 w-full object-cover rounded-xl"
            />

            <h2 className="mt-3 font-semibold text-gray-700">
              {product.name}
            </h2>

            <p className="text-sm text-gray-500 line-through">
              ₹{product.basePrice}
            </p>

            <p className="text-pink-600 font-bold text-lg">
              ₹{product.finalPrice}
            </p>

            <button className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-full hover:opacity-90 transition">
              Order Now 💕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
