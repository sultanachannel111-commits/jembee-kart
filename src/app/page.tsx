"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header"; // small h

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/qikink/products");
        const qikinkData = await res.json();

        if (!qikinkData?.data) {
          setLoading(false);
          return;
        }

        const pricingSnap = await getDocs(collection(db, "productPricing"));

        const pricingMap: any = {};
        pricingSnap.forEach((doc) => {
          pricingMap[doc.id] = doc.data().sellingPrice;
        });

        const mergedProducts = qikinkData.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          image: product.images?.[0] || "/placeholder.png",
          basePrice: product.product_price,
          finalPrice:
            pricingMap[product.id] ||
            Number(product.product_price) + 150,
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

  return (
    <>
      <Header />

      {loading ? (
        <div className="min-h-screen flex items-center justify-center text-xl">
          Loading products...
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white p-6 pb-24">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl shadow hover:shadow-xl transition"
              >
                <img
                  src={product.image}
                  className="h-40 w-full object-cover rounded-xl"
                  alt={product.name}
                />

                <h2 className="mt-3 font-semibold text-gray-700 line-clamp-2">
                  {product.name}
                </h2>

                <p className="text-sm text-gray-500 line-through">
                  ₹{product.basePrice}
                </p>

                <p className="text-pink-600 font-bold text-lg">
                  ₹{product.finalPrice}
                </p>

                <button
                  onClick={() => {
                    setClickedId(product.id);
                    setTimeout(() => setClickedId(null), 300);
                  }}
                  className={`mt-3 w-full py-2 rounded-full text-white transition
                  ${
                    clickedId === product.id
                      ? "bg-gray-400"
                      : "bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                  }`}
                >
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
