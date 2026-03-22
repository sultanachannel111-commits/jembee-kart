"use client";

import { Star } from "lucide-react";
import { getMixedReviews } from "@/lib/reviewSystem";

export default function ReviewSection({ product }: any) {

  const reviews = getMixedReviews(product);

  if (!reviews.length) return null;

  return (
    <div className="mt-6">

      <h2 className="font-bold text-lg mb-3">
        ⭐ Customer Reviews
      </h2>

      <div className="space-y-3">

        {reviews.map((r: any, i: number) => (

          <div
            key={i}
            className="bg-white p-3 rounded-xl shadow-sm"
          >

            {/* Name */}
            <div className="flex items-center justify-between">

              <span className="font-medium text-sm">
                {r.name}
              </span>

              {/* ⭐ Rating */}
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

            {/* Fake Tag */}
            {r.fake && (
              <span className="text-[10px] text-gray-400">
                Verified buyer
              </span>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}
