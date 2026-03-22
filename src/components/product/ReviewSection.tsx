"use client";

import { Star } from "lucide-react";
import { getMixedReviews, getReviewStats } from "@/lib/reviewSystem";

export default function ReviewSection({ product }: any) {

  const reviews = getMixedReviews(product);

  if (!reviews.length) return null;

  // ✅ Stats calculate
  const { stats, average } = getReviewStats(reviews);

  return (
    <div className="mt-6">

      {/* ⭐ TITLE */}
      <h2 className="font-bold text-lg mb-3">
        ⭐ Customer Reviews
      </h2>

      {/* ⭐ RATING SUMMARY */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <div className="flex items-center gap-3 mb-2">

          <span className="text-2xl font-bold text-yellow-500">
            {average}⭐
          </span>

          <span className="text-sm text-gray-500">
            ({stats.total} reviews)
          </span>

        </div>

        {/* ⭐ BREAKDOWN */}
        {[5,4,3,2,1].map((star) => (

          <div key={star} className="flex items-center gap-2 text-sm mt-1">

            <span className="w-6">{star}⭐</span>

            <div className="flex-1 h-2 bg-gray-200 rounded">

              <div
                className="h-2 bg-yellow-500 rounded"
                style={{
                  width: `${
                    stats.total
                      ? (stats[star] / stats.total) * 100
                      : 0
                  }%`
                }}
              />

            </div>

            <span className="w-6 text-right text-gray-600">
              {stats[star]}
            </span>

          </div>

        ))}

      </div>

      {/* ⭐ REVIEWS LIST */}
      <div className="space-y-3">

        {reviews.map((r: any, i: number) => (

          <div
            key={i}
            className="bg-white p-3 rounded-xl shadow-sm"
          >

            {/* Name + Rating */}
            <div className="flex items-center justify-between">

              <span className="font-medium text-sm">
                {r.name}
              </span>

              <div className="flex items-center gap-1">

                {[1,2,3,4,5].map((s)=>(
                  <Star
                    key={s}
                    size={12}
                    className={`${
                      r.rating >= s
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}

              </div>

            </div>

            {/* Comment */}
            <p className="text-sm text-gray-600 mt-1">
              {r.comment}
            </p>

            {/* Verified */}
            <span className="text-[10px] text-green-600">
              ✔ Verified buyer
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}
