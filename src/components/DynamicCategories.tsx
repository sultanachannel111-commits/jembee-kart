"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function DynamicCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Category[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));

      setCategories(list);
    });

    return () => unsubscribe();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="bg-white py-3 overflow-x-auto no-scrollbar">
      <div className="flex gap-4 px-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`}>
            <div className="flex flex-col items-center min-w-[80px] cursor-pointer transition-all duration-300">

              {/* 🔥 ICON BOX */}
              <div className="w-16 h-16 rounded-full overflow-hidden shadow
                              hover:scale-110 transition-all duration-300">

                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 📝 TEXT */}
              <p className="text-xs mt-2 font-medium text-center text-gray-600
                            transition-all duration-300">
                {cat.name}
              </p>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
