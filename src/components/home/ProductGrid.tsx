"use client";

import Link from "next/link";
import { Heart, Star, Flame } from "lucide-react";
import { getFinalPrice } from "@/lib/priceCalculator";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

type Props = {
  products: any[];
  title?: string;
};

export default function ProductGrid({ products, title }: Props) {

  const [likedItems, setLikedItems] = useState<any>({}); // ❤️ NEW

  // ❤️ TOGGLE FUNCTION (NEW)
  const toggleWishlist = async (e:any, product:any) => {
    e.preventDefault(); // 🔥 LINK CLICK STOP
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

        setLikedItems((prev:any)=>({
          ...prev,
          [product.id]: false
        }));

      } else {

        await setDoc(ref,{
          ...product,
          createdAt: new Date()
        });

        setLikedItems((prev:any)=>({
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

      {/* Section Title */}
      {title && (
        <h2 className="text-lg font-bold mb-3">{title}</h2>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((product: any) => {

          const finalPrice = getFinalPrice(product);

          const rating = product.rating || 4.5;
          const reviews = product.reviews || Math.floor(Math.random() * 200) + 50;

          const realSold = product.sold || 0;
          const demoSold = product.demoSold || Math.floor(Math.random() * 300) + 50;

          const totalSold = realSold + demoSold;

          // Image fallback system
          const image =
            product.image ||
            product.imageUrl ||
            product.frontImage ||
            "https://picsum.photos/400";

          return (

            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-3 relative"
            >

              {/* ❤️ FIXED HEART */}
              <Heart
                size={18}
                onClick={(e)=>toggleWishlist(e, product)}
                className={`absolute top-2 right-2 cursor-pointer ${
                  likedItems[product.id]
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400"
                }`}
              />

              {/* Discount */}
              {product.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}

              {/* Product Image */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </Link>

              {/* Name */}
              <div className="mt-2 text-sm truncate font-medium">
                {product.name}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-1">

                {[1,2,3,4,5].map((star)=>{

                  const full = rating >= star;
                  const half = rating >= star - 0.5 && rating < star;

                  return (

                    <div
                      key={star}
                      className="relative w-[14px] h-[14px]"
                    >

                      <Star
                        size={14}
                        className="text-gray-300"
                      />

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

                <span className="text-xs text-gray-600 ml-1">
                  {rating}
                </span>

                <span className="text-xs text-gray-400">
                  ({reviews})
                </span>

              </div>

              {/* Sold */}
              <div className="flex items-center gap-1 text-green-600 text-xs mt-1">

                <Flame size={14} />

                {totalSold} sold

              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-1">

                <span className="font-bold text-black">
                  ₹{finalPrice}
                </span>

                {product.originalPrice && (
                  <span className="line-through text-gray-400 text-xs">
                    ₹{product.originalPrice}
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
