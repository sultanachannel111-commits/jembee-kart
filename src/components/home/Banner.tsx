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

      setBanners(data);
    };

    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="px-3 mt-3">
      {banners.map((b) => (
        <img
          key={b.id}
          src={b.image}
          className="w-full h-[160px] object-cover rounded-xl shadow mb-3"
        />
      ))}
    </div>
  );
}
