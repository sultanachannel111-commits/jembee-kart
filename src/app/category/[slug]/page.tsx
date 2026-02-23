"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [sortType, setSortType] = useState("latest");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(
        collection(db, "products"),
        where("categorySlug", "==", slug)
      );

      const snapshot = await getDocs(q);
      let list: any[] = [];

      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // Price Filter
      if (maxPrice) {
        list = list.filter(
          (item) => Number(item.price) <= Number(maxPrice)
        );
      }

      // Sorting
      if (sortType === "low") {
        list.sort((a, b) => a.price - b.price);
      }
      if (sortType === "high") {
        list.sort((a, b) => b.price - a.price);
      }

      setProducts(list);
    };

    if (slug) fetchProducts();
  }, [slug, sortType, maxPrice]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 capitalize">
        {slug}
      </h1>

      {/* FILTER UI */}
      <div className="flex gap-4 mb-6">
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="latest">Latest</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-3 rounded-lg">
            <img
              src={product.image}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="mt-2 font-semibold">{product.name}</h3>
            <p className="text-pink-600 font-bold">
              ₹{product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
