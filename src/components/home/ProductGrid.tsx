"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";

type Props = {
  products: any[];
  title?: string;
};

export default function ProductGrid({ products, title }: Props) {

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-4">

      {/* Section Title */}
      {title && (
        <h2 className="text-lg font-bold mb-3">{title}</h2>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((product: any) => {

          /* ⭐ Rating */
          const rating = product.rating || 4.5;

          /* ⭐ Reviews */
          const reviews =
            product.reviews || Math.floor(Math.random() * 200) + 50;

          /* 🔥 REAL SOLD (Firestore) */
          const realSold = product.sold || 0;

          /* 🔥 DEMO SOLD (Marketing) */
          const demoSold =
            product.demoSold || Math.floor(Math.random() * 300) + 50;

          /* 🔥 TOTAL SOLD */
          const totalSold = realSold + demoSold;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-3 relative"
            >

              {/* Wishlist */}
              <Heart
                size={18}
                className="absolute top-2 right-2 text-gray-400"
              />

              {/* Discount Badge */}
              {product.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}

              {/* Product Image */}
              <Link href={`/product/${product.id}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </Link>

              {/* Product Name */}
              <div className="mt-2 text-sm font-medium truncate">
                {product.name}
              </div>

              {/* ⭐ Rating */}
              <div className="flex items-center gap-1 mt-1">

                {[1,2,3,4,5].map((star)=>{

                  const filled = rating >= star;

                  return (
                    <Star
                      key={star}
                      size={14}
                      className={
                        filled
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  );

                })}

                <span className="text-xs text-gray-600 ml-1">
                  {rating}
                </span>

                <span className="text-xs text-gray-400">
                  ({reviews})
                </span>

              </div>

              {/* 🔥 Sold */}
              <div className="text-xs text-green-600 mt-1">
                🔥 {totalSold} sold
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-1">

                <span className="font-bold text-black">
                  ₹{product.sellPrice || product.price || 0}
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
