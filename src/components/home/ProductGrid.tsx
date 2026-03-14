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

          const rating = product.rating || 4.5;
          const reviews = product.reviews || Math.floor(Math.random() * 200) + 20;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-3 relative"
            >

              {/* Wishlist Icon */}
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
              <div className="flex items-center gap-1 mt-1 text-yellow-500">

                {[1,2,3,4,5].map((star)=>(
                  <Star
                    key={star}
                    size={12}
                    fill={star <= Math.round(rating) ? "#facc15" : "none"}
                    stroke="#facc15"
                  />
                ))}

                {/* Rating Number */}
                <span className="text-xs text-gray-600 ml-1">
                  {rating}
                </span>

                {/* Review Count */}
                <span className="text-xs text-gray-400">
                  ({reviews})
                </span>

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
