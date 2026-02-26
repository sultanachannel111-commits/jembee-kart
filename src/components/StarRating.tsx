"use client";

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((star) => (
        <span key={star}>
          {rating >= star ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
