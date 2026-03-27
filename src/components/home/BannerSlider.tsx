"use client";

import { useEffect, useState } from "react";

export default function BannerSlider({ banners }: any) {

  const [current, setCurrent] = useState(0);

  // ✅ FULL SAFETY
  if (!Array.isArray(banners) || banners.length === 0) {
    return (
      <div className="mt-2 px-3 text-center text-gray-500">
        No banners
      </div>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  const currentBanner = banners[current];

  return (
    <div className="mt-2 px-3">

      {currentBanner?.image && (
        <img
          src={currentBanner.image}
          className="w-full h-[160px] object-cover rounded-xl"
        />
      )}

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {banners.map((_: any, i: number) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              current === i ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
