"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Mic, ShoppingCart, Home, Grid, User } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { cart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchBanners();
    fetchFestival();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBanners = async () => {
    const snap = await getDocs(collection(db, "banners"));
    setBanners(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchFestival = async () => {
    const snap = await getDoc(doc(db, "settings", "festival"));
    if (snap.exists()) setFestival(snap.data());
  };

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Auto slider
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* 🔴 TOP HEADER */}
      <div className="bg-pink-600 text-white px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-black">jembee</span>{" "}
          <span className="text-white">kart</span>
        </h1>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="bg-black px-4 py-1 rounded-full text-sm">
              Login
            </button>
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-1 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🟣 SEARCH SECTION */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full px-4 py-3 flex-1 shadow-md">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search for products..."
              className="flex-1 outline-none px-3 text-sm bg-transparent"
            />
            <Mic size={20} className="text-gray-500" />
          </div>

          <Link href="/login">
            <button className="bg-purple-700 text-white px-4 py-3 rounded-full text-sm shadow-md">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* 🎉 FESTIVAL BANNER (Hidden Default) */}
      {festival?.active && (
        <div className="px-4 mt-4">
          <img
            src={festival.image}
            className="rounded-2xl shadow-md"
          />
        </div>
      )}

      {/* 🟡 CATEGORY ROW */}
      <div className="bg-white py-4 px-2 overflow-x-auto flex gap-4 mt-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center min-w-[80px]">
            <img
              src={cat.image}
              className="w-16 h-16 rounded-full border-2 border-pink-500 p-1 object-cover"
            />
            <span className="text-xs mt-2 text-center">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 🎀 MAIN SLIDER */}
      {banners.length > 0 && (
        <div className="px-4 mt-4">
          <div className="relative rounded-2xl overflow-hidden shadow-md">
            <img
              src={banners[currentSlide]?.image}
              className="w-full h-40 object-cover"
            />
          </div>

          <div className="flex justify-center mt-2 gap-2">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 🟪 PRODUCT SECTION */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-purple-700 mb-4">
          Best of JembeeKart
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-2xl shadow p-3"
            >
              <img
                src={product.image}
                className="rounded-xl w-full h-40 object-cover"
              />
              <div className="mt-2 text-sm font-medium">
                {product.name}
              </div>
              <div className="text-black font-bold">
                ₹{product.price}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 🔻 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <Link href="/" className="flex flex-col items-center text-xs">
          <Home size={20} />
          Home
        </Link>

        <Link href="/categories" className="flex flex-col items-center text-xs text-blue-600">
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
