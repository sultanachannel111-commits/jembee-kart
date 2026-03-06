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

        {products.map((product: any) => (

          <div
            key={product.id}
            className="bg-white rounded-xl shadow p-3 relative"
          >

            {/* Wishlist Icon */}
            <Heart
              size={18}
              className="absolute top-2 right-2 text-gray-400"
            />

            {/* Product Image */}
            <Link href={`/product/${product.id}`}>
              <img
                src={product.image}
                className="w-full h-40 object-cover rounded-lg"
              />
            </Link>

            {/* Discount Badge */}
            {product.discount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.discount}% OFF
              </span>
            )}

            {/* Product Name */}
            <div className="mt-2 text-sm truncate">
              {product.name}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs mt-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span>{product.rating || 4.5}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mt-1">

              <span className="font-bold">
                ₹{product.price}
              </span>

              {product.originalPrice && (
                <span className="line-through text-gray-400 text-xs">
                  ₹{product.originalPrice}
                </span>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
