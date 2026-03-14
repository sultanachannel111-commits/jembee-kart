"use client";

export default function StarRating({ rating }: { rating: number }) {

  return (
    <div className="flex items-center gap-1 text-yellow-500 text-sm">

      {[1,2,3,4,5].map((star)=>{

        const full = rating >= star;
        const half = rating >= star - 0.5 && rating < star;

        return (

          <span key={star} className="relative inline-block w-4">

            {/* empty star */}
            <span className="text-gray-300">★</span>

            {/* full star */}
            {full && (
              <span className="absolute left-0 top-0 text-yellow-500">★</span>
            )}

            {/* half star */}
            {half && (
              <span className="absolute left-0 top-0 text-yellow-500 overflow-hidden w-1/2">
                ★
              </span>
            )}

          </span>

        )

      })}

    </div>
  );
}
