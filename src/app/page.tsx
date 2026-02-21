"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  // 🔥 Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const firestoreProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(firestoreProducts);
      } catch (error) {
        console.error("Firestore fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p: any) =>
    normalize(p.name || "").includes(normalize(search))
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-28">

        {/* 🔍 Search Bar */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 outline-none text-sm"
            />
            🔍
          </div>
        </div>

        {/* 🛍 Products */}
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                className="bg-white p-3 rounded-xl shadow"
              >
                <img
                  src={product.image}
                  className="h-40 w-full object-cover rounded-lg"
                />

                <h2 className="text-sm mt-2 line-clamp-2">
                  {product.name}
                </h2>

                <RatingStars productId={product.id} />

                <p className="font-bold text-lg">
                  ₹{product.sellingPrice}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.sellingPrice,
                        quantity: 1,
                      })
                    }
                    className="flex-1 bg-yellow-500 text-white py-2 rounded"
                  >
                    Add to Cart
                  </button>

                  <button className="flex-1 bg-orange-500 text-white py-2 rounded">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔻 Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2 text-xs">
        <a href="/">🏠 Home</a>
        <a href="/categories">📂 Category</a>
        <a href="/account">👤 Account</a>
        <a href="/cart" className="relative">
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </>
  );
}
