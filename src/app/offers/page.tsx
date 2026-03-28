"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function OffersPage() {

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const productSnap = await getDocs(collection(db, "products"));
        const offerSnap = await getDocs(collection(db, "offers"));

        const allProducts = productSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // 🔥 ACTIVE OFFERS
        const activeOffers = offerSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((o: any) =>
            o.active &&
            new Date(o.endDate).getTime() > Date.now()
          );

        const result = allProducts.map((product: any) => {

          // ✅ SAFE PRICE (MAIN FIX)
          const basePrice = Number(
            product?.price ||
            product?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            0
          );

          // ❌ अगर price ही नहीं तो skip
          if (basePrice <= 0) return null;

          // ✅ SAFE OFFER MATCH
          let matchedOffer = activeOffers.find((o: any) => {

            // product based offer
            if (
              o.type === "product" &&
              o.productId?.trim() === product.id?.trim()
            ) return true;

            // category based offer
            if (
              o.type === "category" &&
              o.category?.toLowerCase().trim() ===
              product.category?.toLowerCase().trim()
            ) return true;

            return false;
          });

          if (!matchedOffer) return null;

          const discount = Number(matchedOffer.discount || 0);

          // ✅ FINAL PRICE (₹0 FIXED)
          const finalPrice = Math.max(
            1,
            Math.round(basePrice - (basePrice * discount) / 100)
          );

          return {
            ...product,
            discount,
            finalPrice,
            basePrice
          };

        }).filter(Boolean);

        setProducts(result);

      } catch (err) {
        console.log("❌ Offer load error:", err);
      }

    };

    fetchData();

  }, []);

  return (

    <div className="p-4 pt-[96px]">

      {/* 🔥 TITLE */}
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🔥 Hot Offers
      </h1>

      {/* ❌ NO DATA */}
      {products.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No offers available 😢
        </p>
      )}

      {/* 🛒 GRID */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((p: any) => (

          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-2 relative hover:scale-105 transition"
          >

            {/* 🔥 DISCOUNT TAG */}
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {p.discount}% OFF
            </span>

            {/* 🖼 IMAGE FIX */}
            <img
              src={
                p?.image ||
                p?.variations?.[0]?.images?.front ||
                "https://via.placeholder.com/300"
              }
              className="w-full h-40 object-cover rounded"
            />

            {/* 📝 NAME */}
            <div className="mt-2 text-sm font-medium truncate">
              {p.name}
            </div>

            {/* 💰 PRICE */}
            <div className="flex gap-2 items-center mt-1">

              <span className="font-bold text-red-600">
                ₹{p.finalPrice}
              </span>

              <span className="text-gray-400 line-through text-xs">
                ₹{p.basePrice}
              </span>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );

}
