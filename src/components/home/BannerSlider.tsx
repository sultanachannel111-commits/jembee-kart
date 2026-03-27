"use client";

import { useEffect, useState } from "react";

export default function BannerSlider({ banners }: any) {

  const [current, setCurrent] = useState(0);

  // ✅ Safety (crash nahi hoga)
  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  // 🔄 Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="mt-3 px-3">

      {/* 🔥 BANNER IMAGE */}
      <div className="w-full h-[180px] rounded-xl overflow-hidden shadow">

        <img
          src={banners[current]?.image}
          alt="banner"
          className="w-full h-full object-cover"
        />

      </div>

      {/* 🔵 DOT INDICATOR */}
      <div className="flex justify-center gap-2 mt-2">
        {banners.map((_: any, i: number) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              current === i ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
