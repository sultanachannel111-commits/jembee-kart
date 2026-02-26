"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function RelatedProducts({ category }: any) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "products"),
        where("category", "==", category)
      );
      const snap = await getDocs(q);
      const data = snap.docs.slice(0,4).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    };

    fetch();
  }, [category]);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">Related Products</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`}>
            <div className="border rounded p-2 hover:shadow-lg">
              <img
                src={p.image || p.images?.[0]}
                className="h-32 w-full object-cover"
              />
              <p className="text-sm mt-2">{p.name}</p>
              <p className="font-bold text-pink-600">
                ₹{p.sellingPrice || p.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
