"use client";

import { getFinalPrice } from "@/utils/applyDiscount";
import { getProductPrice } from "@/utils/getPrice";

export default function ProductCard({ product, discount }: any) {

  const basePrice = getProductPrice(product);
  const finalPrice = getFinalPrice(product, discount);

  const image =
    product?.image ||
    product?.variations?.[0]?.images?.front ||
    "https://via.placeholder.com/300";

  return (
    <div className="bg-white/10 rounded-xl p-2">

      <img src={image} className="w-full h-36 object-cover rounded"/>

      <p>{product.name}</p>

      {/* 💰 PRICE */}
      <div className="flex gap-2 items-center">
        <span className="text-yellow-400 font-bold">
          ₹{finalPrice}
        </span>

        {discount > 0 && (
          <span className="line-through text-gray-400 text-xs">
            ₹{basePrice}
          </span>
        )}
      </div>

    </div>
  );
}
