"use client";

import Link from "next/link";
import { Heart, Star, Flame } from "lucide-react";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

type Props = {
  products: any[];
  title?: string;
  theme?: any;
};

export default function ProductGrid({ products, title, theme }: Props) {

  const [likedItems, setLikedItems] = useState<any>({});
  const [visibleCount, setVisibleCount] = useState(4);

  // 🔥 LOAD ANIMATION
  useEffect(() => {
    if (!products) return;

    let i = 4;

    const interval = setInterval(() => {
      i += 2;
      setVisibleCount(i);

      if (i >= products.length) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [products]);

  // ❤️ WISHLIST
  const toggleWishlist = async (e: any, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const user = auth.currentUser;

    if (!user) {
      alert("Login first");
      return;
    }

    const ref = doc(db, "wishlist", user.uid, "items", product.id);

    try {
      if (likedItems[product.id]) {
        await deleteDoc(ref);

        setLikedItems((prev: any) => ({
          ...prev,
          [product.id]: false
        }));

      } else {
        await setDoc(ref, {
          ...product,
          createdAt: new Date()
        });

        setLikedItems((prev: any) => ({
          ...prev,
          [product.id]: true
        }));
      }

    } catch (err) {
      console.log(err);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-4">

      {/* 🔥 TITLE */}
      {title && (
        <h2
          style={{ color: theme?.cardText || "#000" }}
          className="text-lg font-bold mb-3"
        >
          {title}
        </h2>
      )}

      {/* 🔥 GRID */}
      <div className="grid grid-cols-2 gap-4">

        {products.slice(0, visibleCount).map((product: any, index:number) => {

          // ✅ ORIGINAL PRICE (BASE)
         const original = product.originalPrice || product.price || 0;
const finalPrice = product.price || 0;
const discount = product.discount || 0; 
          const rating = product.rating || 4.5;
          const reviews = product.reviews || Math.floor(Math.random() * 200) + 50;

          const realSold = product.sold || 0;
          const demoSold = product.demoSold || Math.floor(Math.random() * 300) + 50;

          const totalSold = realSold + demoSold;

          const image =
            product.variations?.[0]?.images?.main ||
            product.variations?.[0]?.images?.front ||
            product.variations?.[0]?.images?.back ||
            product.variations?.[0]?.images?.side ||
            product.image ||
            product.imageUrl ||
            product.frontImage ||
            "";

          return (
            <div
              key={product.id}
              style={{
                background: theme?.cardBg || "#ffffff",
                color: theme?.cardText || "#000"
              }}
              className={`rounded-xl shadow p-3 relative
                transition-all duration-500
                ${index >= 4 ? "opacity-0 animate-fadeIn" : "opacity-100"}
              `}
            >
              {discount > 0 && (
  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
    {discount}% OFF
  </span>
)}

              {/* ❤️ Wishlist */}
              <Heart
                size={18}
                onClick={(e) => toggleWishlist(e, product)}
                className={`absolute top-2 right-2 cursor-pointer ${
                  likedItems[product.id]
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400"
                }`}
              />

              {/* 🔥 IMAGE */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={image || "/no-image.png"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
              </Link>

              {/* 🔥 NAME */}
              <div
                style={{ color: theme?.cardText || "#000" }}
                className="mt-2 text-sm truncate font-medium"
              >
                {product.name}
              </div>

              {/* ⭐ RATING */}
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => {

                  const full = rating >= star;
                  const half = rating >= star - 0.5 && rating < star;

                  return (
                    <div key={star} className="relative w-[14px] h-[14px]">

                      <Star size={14} className="text-gray-300" />

                      {full && (
                        <Star
                          size={14}
                          className="absolute top-0 left-0 text-yellow-500 fill-yellow-500"
                        />
                      )}

                      {half && (
                        <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                          <Star
                            size={14}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        </div>
                      )}

                    </div>
                  );
                })}

                <span className="text-xs ml-1">
                  {rating}
                </span>

                <span className="text-xs opacity-60">
                  ({reviews})
                </span>
              </div>

              {/* 🔥 SOLD */}
              <div
                style={{ color: theme?.priceColor || "#16a34a" }}
                className="flex items-center gap-1 text-xs mt-1"
              >
                <Flame size={14} />
                {totalSold} sold
              </div>

              {/* 💰 PRICE */}
              <div className="flex items-center gap-2 mt-1">

                <span
                  style={{ color: theme?.priceColor || "#16a34a" }}
                  className="font-bold"
                >
                  ₹{finalPrice}
                </span>

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
