"use client";

import { useEffect, useState } from "react";

/**
 * 🔥 Smart Timer Hook
 * 2 hour countdown (7200 sec)
 * Works when:
 * - product.isTrending === true
 * - OR stock <= 5
 */
export function useTimer(product: any, stock: number) {
  const [timeLeft, setTimeLeft] = useState<number>(7200);

  useEffect(() => {
    // 🛑 safety check (VERY IMPORTANT)
    if (!product) return;

    const isActive =
      product?.isTrending === true || Number(stock) <= 5;

    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [product, stock]);

  return timeLeft;
}

/**
 * 🕒 Format time (2h 30m)
 */
export function formatTime(sec: number) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  return `${hours}h ${minutes}m`;
}
