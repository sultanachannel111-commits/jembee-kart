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

  // 🎤 Voice Search
  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript);
    };
  };

  const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

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

  const categories = [
    "All",
    "T-Shirts",
    "Oversized",
    "Hoodies",
    "Sweatshirts",
    "Polos",
    "Tank Tops",
    "Kids",
    "Tote Bags",
    "Caps",
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-28">

        {/* 🔍 PREMIUM SEARCH BAR */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-4">
          <div className="flex items-center gap-3">

            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md flex-1">

              {/* Search Icon */}
              <svg
                className="w-5 h-5 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 outline-none text-sm bg-transparent"
              />

              {/* Mic Icon */}
              <svg
                onClick={startVoiceSearch}
                className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>

            <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
              Sign In
            </button>

          </div>
        </div>

        {/* 🟣 CATEGORY ROW */}
        <div className="flex overflow-x-auto gap-4 px-4 py-4 bg-white">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center min-w-[70px]">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center shadow-sm text-xs font-semibold text-purple-600">
                {cat[0]}
              </div>
              <span className="text-xs mt-1 text-gray-700">
                {cat}
              </span>
            </div>
          ))}
        </div>

        {/* 🎨 HERO BANNER */}
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold">
            Premium Print On Demand
          </h2>
          <p className="text-sm mt-2">
            Create & Sell Custom Apparel Easily
          </p>
          <button className="mt-4 bg-white text-purple-600 px-5 py-2 rounded-full text-sm font-semibold">
            Shop Now
          </button>
        </div>

        {/* 🛍 PRODUCTS */}
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    className="h-40 w-full object-cover rounded-xl"
                    alt={product.name}
                  />
                </div>

                <h2 className="text-sm mt-3 font-medium line-clamp-2 text-gray-800">
                  {product.name}
                </h2>

                <RatingStars productId={product.id} />

                <p className="font-bold text-black mt-2">
                  ₹{product.sellingPrice}
                </p>

                <div className="flex gap-2 mt-3">
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
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-xs"
                  >
                    Add
                  </button>

                  <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs">
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔻 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 text-xs shadow-inner">
        <a href="/" className="flex flex-col items-center">
          <span>🏠</span>
          Home
        </a>
        <a href="/categories" className="flex flex-col items-center">
          <span>📂</span>
          Categories
        </a>
        <a href="/account" className="flex flex-col items-center">
          <span>👤</span>
          Account
        </a>
        <a href="/cart" className="relative flex flex-col items-center">
          <span>🛒</span>
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </>
  );
}
