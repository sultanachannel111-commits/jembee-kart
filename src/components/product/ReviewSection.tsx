"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { getMixedReviews, getReviewStats } from "@/lib/reviewSystem";

export default function ReviewSection({ product }: any) {

  const initialReviews = getMixedReviews(product);
  const [reviews, setReviews] = useState(initialReviews);

  if (!reviews.length) return null;

  const { stats, average } = getReviewStats(reviews);

  const sortHelpful = () => {
    const sorted = [...reviews].sort(
      (a: any, b: any) => (b.likes || 0) - (a.likes || 0)
    );
    setReviews(sorted);
  };

  const handleLike = (index: number) => {
    const updated = [...reviews];
    updated[index].likes = (updated[index].likes || 0) + 1;
    setReviews(updated);
  };

  return (
    <div className="mt-6 px-2">

      {/* ⭐ HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">⭐ Customer Reviews</h2>

        <button
          onClick={sortHelpful}
          className="text-xs bg-gray-100 px-3 py-1 rounded-full"
        >
          Most Helpful
        </button>
      </div>

      {/* ⭐ SUMMARY */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4">

        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-yellow-500">
            {average}⭐
          </span>
          <span className="text-sm text-gray-500">
            ({stats.total} reviews)
          </span>
        </div>

        {[5,4,3,2,1].map((star) => (
          <div key={star} className="flex items-center gap-2 text-sm mt-1">
            <span className="w-6">{star}⭐</span>

            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-yellow-500 rounded-full"
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

      {/* ⭐ REVIEWS */}
      <div className="space-y-4">

        {reviews.map((r: any, i: number) => (

          <div
            key={r.id || i}
            className="bg-white p-4 rounded-2xl shadow-sm"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-sm">
                {r.name}
              </span>

              <div className="flex gap-1">
                {[1,2,3,4,5].map((s)=>(
                  <Star
                    key={s}
                    size={14}
                    className={`${
                      r.rating >= s
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* COMMENT */}
            <p className="text-sm text-gray-600 mb-2">
              {r.comment}
            </p>

            {/* 📸 IMAGE SLIDER */}
            {(r.images?.length > 0 || r.image) && (
              <div className="flex gap-2 overflow-x-auto pb-2">

                {/* OLD IMAGE */}
                {r.image && (
                  <img
                    src={r.image}
                    className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                  />
                )}

                {/* MULTIPLE */}
                {r.images?.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                  />
                ))}

              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center justify-between mt-2">

              <button
                onClick={() => handleLike(i)}
                className="text-xs text-blue-600"
              >
                👍 Helpful ({r.likes || 0})
              </button>

              <span className="text-[10px] text-green-600">
                ✔ Verified buyer
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
