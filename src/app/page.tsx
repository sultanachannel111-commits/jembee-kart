"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Mic,
  ShoppingCart,
  Home,
  Grid,
  User,
  Star,
} from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { cart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const catSnap = await getDocs(collection(db, "categories"));
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const bannerSnap = await getDocs(collection(db, "banners"));
    setBanners(bannerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const productSnap = await getDocs(collection(db, "products"));
    setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const festSnap = await getDoc(doc(db, "settings", "festival"));
    if (festSnap.exists()) setFestival(festSnap.data());
  };

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="bg-gray-100 min-h-screen pb-20">

      {/* 🔴 TOP WHITE HEADER */}
      <div className="bg-white px-4 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold">
          <span className="text-black">jembee</span>{" "}
          <span className="text-pink-600">kart</span>
        </h1>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm">
              Sign In
            </button>
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search for products..."
            className="flex-1 bg-transparent outline-none px-3 text-sm"
          />
          <Mic size={18} className="text-gray-500" />
        </div>
      </div>

      {/* 🎉 FESTIVAL (HIDDEN DEFAULT) */}
      {festival?.active && (
        <div className="px-4 mt-2">
          <img
            src={festival.image}
            className="rounded-xl shadow"
            alt="festival"
          />
        </div>
      )}

      {/* 🟡 CATEGORY ROW */}
      <div className="bg-white py-4 px-3 overflow-x-auto flex gap-4 mt-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex flex-col items-center min-w-[75px]">
            <div className="w-16 h-16 rounded-full border-2 border-pink-500 p-1">
              <img
                src={cat.image}
                className="w-full h-full rounded-full object-cover"
                alt={cat.name}
              />
            </div>
            <span className="text-xs mt-2 text-center">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 🟣 FLIPKART STYLE SLIDER */}
      {banners.length > 0 && (
        <div className="px-4 mt-4">
          <div className="relative rounded-xl overflow-hidden shadow">
            <img
              src={banners[slide]?.image}
              className="w-full h-44 object-cover"
              alt="banner"
            />
          </div>

          <div className="flex justify-end mt-2 gap-1 pr-2">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  slide === i ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 🔵 PRODUCT SECTION */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-purple-600 mb-4">
          Best of JembeeKart
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-xl shadow p-3"
            >
              <div className="relative">
                <img
                  src={product.image}
                  className="rounded-lg w-full h-40 object-cover"
                  alt={product.name}
                />

                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full flex items-center gap-1 shadow text-xs">
                  <span className="font-medium">4.4</span>
                  <Star size={14} className="text-green-600 fill-green-600" />
                  <span className="text-gray-500">(185)</span>
                </div>
              </div>

              <div className="mt-2 text-sm font-medium truncate">
                {product.name}
              </div>

              <div className="font-bold text-black">
                ₹{product.sellingPrice || product.price}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ⚫ BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <Link href="/" className="flex flex-col items-center text-xs text-blue-600">
          <Home size={20} />
          Home
        </Link>

        <Link href="/categories" className="flex flex-col items-center text-xs">
          <Grid size={20} />
          Categories
        </Link>

        <Link href="/account" className="flex flex-col items-center text-xs">
          <User size={20} />
          Account
        </Link>

        <Link href="/cart" className="flex flex-col items-center text-xs relative">
          <ShoppingCart size={20} />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs px-1 rounded-full">
              {cart.length}
            </span>
          )}
        </Link>
      </div>

    </div>
  );
}
