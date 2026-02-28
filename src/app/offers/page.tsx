"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Flame } from "lucide-react";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const snap = await getDocs(collection(db, "products"));
      const allProducts = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔥 Only discounted products
      const discounted = allProducts.filter(
        (p: any) => p.originalPrice && p.originalPrice > p.price
      );

      setOffers(discounted);
    };

    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white pt-[96px] p-4">
      
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-red-500" />
        <h1 className="text-2xl font-bold">Hot Offers</h1>
      </div>

      {offers.length === 0 ? (
        <p>No offers available right now 😢</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {offers.map((product: any) => {
            const discount = Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            );

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-xl shadow p-2 relative"
              >
                {/* Discount Badge */}
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {discount}% OFF
                </span>

                <img
                  src={product.image}
                  className="rounded-lg w-full h-40 object-cover"
                />

                <div className="mt-2 text-sm font-medium truncate">
                  {product.name}
                </div>

                <div className="flex gap-2 items-center mt-1">
                  <span className="font-bold">₹{product.price}</span>
                  <span className="text-gray-400 line-through text-xs">
                    ₹{product.originalPrice}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
