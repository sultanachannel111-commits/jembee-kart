"use client";

import Link from "next/link";
import { Heart, Star, Flame } from "lucide-react";
import { getFinalPrice } from "@/utils/getFinalPrice";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

type Props = {
  products: any[];
  title?: string;
  theme?: any;
  offers?: any; // ✅ IMPORTANT
};

export default function ProductGrid({ products, title, theme, offers }: Props) {

  const [likedItems, setLikedItems] = useState<any>({});
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    let i = 4;
    const interval = setInterval(() => {
      i += 2;
      setVisibleCount(i);
      if (i >= products.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-4">

      {title && (
        <h2 className="text-lg font-bold mb-3">{title}</h2>
      )}

      <div className="grid grid-cols-2 gap-4">

        {products.slice(0, visibleCount).map((product: any) => {

          console.log("PRODUCT ID:", product.id);
          console.log("OFFERS:", offers);

          const original =
            product?.variations?.[0]?.sizes?.[0]?.price ||
            product?.price ||
            0;

          const finalPrice = getFinalPrice(product, offers || {});

          const discountPercent =
            original > finalPrice
              ? Math.round(((original - finalPrice) / original) * 100)
              : 0;

          return (
            <div key={product.id} className="bg-white p-3 rounded-xl shadow">

              {discountPercent > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {discountPercent}% OFF
                </span>
              )}

              <Link href={`/product/${product.id}`}>
                <img src={product.image} className="w-full h-40 object-cover"/>
              </Link>

              <p className="text-sm mt-2">{product.name}</p>

              <div className="flex gap-2">
                <span className="font-bold text-green-600">₹{finalPrice}</span>

                {original > finalPrice && (
                  <span className="line-through text-gray-400 text-xs">
                    ₹{original}
                  </span>
                )}
              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}
