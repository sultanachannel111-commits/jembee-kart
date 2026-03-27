"use client";

import { useEffect, useState } from "react";

export default function BannerSlider({ banners }: any) {

  const [current, setCurrent] = useState(0);

  // ✅ SAFETY
  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  // 🔄 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="mt-2 px-3">

      {/* IMAGE */}
      <div className="w-full h-[160px] bg-white rounded-xl flex items-center justify-center">
        <img
          src={banners[current]?.image}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {banners.map((_: any, i: number) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full ${
              current === i ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
