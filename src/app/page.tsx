"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import RatingStars from "@/components/RatingStars";

export default function HomePage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔥 Slider images
  const slides = [
    "/banners/banner1.jpg",
    "/banners/banner2.jpg",
    "/banners/banner3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Voice Search
  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) return;

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
      const snapshot = await getDocs(collection(db, "products"));
      const firestoreProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(firestoreProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p: any) =>
    normalize(p.name || "").includes(normalize(search))
  );

  const categories = [
    { name: "All", image: "/categories/all.jpg" },
    { name: "T-Shirts", image: "/categories/tshirt.jpg" },
    { name: "Hoodies", image: "/categories/hoodie.jpg" },
    { name: "Oversized", image: "/categories/oversized.jpg" },
    { name: "Polos", image: "/categories/polo.jpg" },
    { name: "Mobiles", image: "/categories/mobile.jpg" },
    { name: "Tote Bags", image: "/categories/totebag.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-24">

      {/* 🔍 TOP SEARCH BAR */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
        <div className="flex items-center gap-3">

          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md flex-1">
            {/* Search Icon */}
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 outline-none text-sm"
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
            </svg>
          </div>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            Sign In
          </button>

        </div>
      </div>

      {/* 🟣 CATEGORY ROUND ROW */}
      <div className="flex overflow-x-auto gap-4 px-4 py-4 bg-white">
        {categories.map((cat, index) => (
          <div key={index} className="flex flex-col items-center min-w-[75px]">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-300 shadow-sm">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs mt-1 text-gray-700 text-center">
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* 🎬 SLIDER BANNER */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg relative">
        <img
          src={slides[currentSlide]}
          className="w-full h-48 object-cover transition-all duration-500"
        />

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-purple-600" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 🟣 SECTION TITLE */}
      <h2 className="px-4 mt-6 mb-3 font-semibold text-lg text-purple-700">
        Best of JembeeKart
      </h2>

      {/* 🛍 PRODUCT GRID */}
      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4">
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.id}`)}
              className="bg-white rounded-xl p-3 shadow-sm"
            >
              <img
                src={product.image}
                className="h-40 w-full object-cover rounded-lg"
              />

              <div className="mt-2">
                <RatingStars productId={product.id} />
              </div>

              <h3 className="text-sm mt-1 line-clamp-2">
                {product.name}
              </h3>

              <p className="font-bold mt-1">
                ₹{product.sellingPrice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
