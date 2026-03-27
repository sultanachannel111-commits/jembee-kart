"use client";

import { useEffect, useState } from "react";

export default function BannerSlider({ banners }: any) {

  const [current, setCurrent] = useState(0);

  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="mt-3 px-3">

      {/* 🔥 IMAGE CONTAINER */}
      <div className="w-full aspect-[3/1] rounded-xl overflow-hidden bg-white">

        <img
          src={banners[current]?.image}
          className="w-full h-full object-cover"
        />

      </div>

      {/* 🔵 DOTS */}
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
