"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setItems(data);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">
        Recently Viewed
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <div className="border p-2 rounded">
              <img
                src={p.image || p.images?.[0]}
                className="h-24 w-full object-cover"
              />
              <p className="text-xs mt-1">{p.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
