"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 SLUG → CATEGORY FORMAT (MAIN FIX)
  const slugToCategory = (slug: string) =>
    slug
      ?.replace(/-/g, " ")      // hoodies-and-jackets → hoodies and jackets
      .replace("and", "&")      // and → &
      .toLowerCase();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const targetCategory = slugToCategory(slug);

        // ✅ FIXED FILTER
        const filtered = data.filter((product: any) => {
          if (!product.category) return false;

          return (
            product.category.toLowerCase() === targetCategory
          );
        });

        setProducts(filtered);

      } catch (error) {
        console.log("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  // 🔥 TITLE FIX
  const formatTitle = (slug: string) =>
    slug
      ?.replace(/-/g, " ")
      .replace("and", "&")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[90px]">

      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        {formatTitle(slug)}
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">

          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >

              <img
                src={product.image || product.images?.[0]}
                alt={product.name}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <h2 className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h2>

                <p className="text-pink-600 font-bold mt-2">
                  ₹{product.sellPrice || product.price}
                </p>
              </div>

            </Link>
          ))}

        </div>
      )}
    </div>
  );
}
