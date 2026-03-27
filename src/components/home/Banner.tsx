"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Banner() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const q = query(collection(db, "banners"), orderBy("order", "asc"));
      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // ✅ only active banners
      const active = data.filter((b: any) => b.active !== false);

      setBanners(active);
    };

    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="px-3 mt-3">
      <div className="flex overflow-x-auto gap-3">
        {banners.map((b) => (
          <img
            key={b.id}
            src={b.image}
            className="w-[90%] h-[160px] object-cover rounded-xl shadow"
          />
        ))}
      </div>
    </div>
  );
}
