"use client";

import { useMemo } from "react";

interface Props {
  productId: string;
}

export default function RatingStars({ productId }: Props) {

  // 🔥 Stable Random Generator (product id based)
  const data = useMemo(() => {
    let hash = 0;

    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const rating = (3.5 + (Math.abs(hash) % 15) / 10).toFixed(1); 
    const reviews = 50 + (Math.abs(hash) % 51); // 50–100

    return {
      rating: Number(rating),
      reviews,
    };
  }, [productId]);

  return (
    <div className="flex items-center gap-1 text-xs">

      {/* ⭐ Stars */}
      <div className="flex text-yellow-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index}>
            {index < Math.round(data.rating) ? "★" : "☆"}
          </span>
        ))}
      </div>

      {/* Rating Number */}
      <span className="font-semibold text-gray-700">
        {data.rating}
      </span>

      {/* Review Count */}
      <span className="text-gray-400">
        ({data.reviews} reviews)
      </span>

    </div>
  );
}
