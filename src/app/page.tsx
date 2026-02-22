"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function HomePage() {
  const { cartCount } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const productSnap = await getDocs(collection(db, "products"));
      const categorySnap = await getDocs(collection(db, "categories"));
      const bannerSnap = await getDocs(collection(db, "banners"));

      const festivalSnap = await getDoc(doc(db, "settings", "festival"));

      setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategories(categorySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBanners(bannerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      if (festivalSnap.exists()) {
        setFestival(festivalSnap.data());
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-28">

        {/* SEARCH BAR */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white flex items-center px-4 py-2 rounded-full shadow-md flex-1">
              <span className="mr-2 text-gray-400">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 outline-none text-sm"
              />
              <span className="ml-2 text-gray-400">🎤</span>
            </div>

            <Link
              href="/login"
              className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* FESTIVAL BANNER (Hidden until Admin enables) */}
        {festival?.active && (
          <div className="px-4 mt-3">
            <img
              src={festival.image}
              className="w-full h-32 object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        {/* CATEGORY ROW */}
        <div className="flex overflow-x-auto gap-4 px-4 py-4 bg-white mt-3">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 rounded-full border-2 border-pink-400 p-1">
                <img
                  src={cat.image}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-xs mt-2 text-gray-700 text-center">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* MAIN SLIDER BANNER */}
        {banners.length > 0 && (
          <div className="px-4 mt-3">
            <img
              src={banners[0].image}
              className="w-full h-44 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* PRODUCT SECTION */}
        <h2 className="text-purple-700 font-bold text-lg px-4 mt-6">
          Best of JembeeKart
        </h2>

        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product: any) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="bg-white p-3 rounded-2xl shadow-sm"
              >
                <img
                  src={product.image}
                  className="h-40 w-full object-cover rounded-xl"
                />

                <div className="mt-2">
                  <RatingStars productId={product.id} />
                </div>

                <h3 className="text-sm mt-1 font-medium">
                  {product.name}
                </h3>

                <p className="font-bold text-lg mt-1">
                  ₹{product.sellingPrice}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 text-xs shadow-inner">
        <Link href="/" className="flex flex-col items-center">
          🏠 Home
        </Link>

        <Link href="/categories" className="flex flex-col items-center text-blue-600">
          📂 Categories
        </Link>

        <Link href="/account" className="flex flex-col items-center">
          👤 Account
        </Link>

        <Link href="/cart" className="relative flex flex-col items-center">
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </>
  );
}
