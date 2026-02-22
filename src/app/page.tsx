"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Premium Print On Demand",
      subtitle: "Create & Sell Custom Apparel",
      image: "/banners/banner1.jpg",
    },
    {
      title: "Oversized Collection",
      subtitle: "Trendy & Comfortable Styles",
      image: "/banners/banner2.jpg",
    },
    {
      title: "Kids Special",
      subtitle: "Cute & Custom Prints",
      image: "/banners/banner3.jpg",
    },
  ];

  // 🔁 Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    { name: "T-Shirts", image: "/categories/tshirt.png" },
    { name: "Oversized", image: "/categories/oversized.png" },
    { name: "Hoodies", image: "/categories/hoodie.png" },
    { name: "Sweatshirts", image: "/categories/sweatshirt.png" },
    { name: "Polos", image: "/categories/polo.png" },
    { name: "Tank Tops", image: "/categories/tanktop.png" },
    { name: "Kids", image: "/categories/kids.png" },
    { name: "Tote Bags", image: "/categories/totebag.png" },
    { name: "Caps", image: "/categories/cap.png" },
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 pb-24">

        {/* 🔍 SEARCH */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-4">
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* 🟣 CATEGORY */}
        <div className="flex overflow-x-auto gap-4 px-4 py-4 bg-white">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col items-center min-w-[80px]">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs mt-2 text-gray-700 text-center">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* 🎬 AUTO SLIDER */}
        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg h-44">
          <img
            src={slides[currentSlide].image}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-6 text-white">
            <h2 className="text-lg font-bold">
              {slides[currentSlide].title}
            </h2>
            <p className="text-sm mt-1">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 🛍 PRODUCTS */}
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                onClick={() => router.push(`/product/${product.id}`)}
                className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <img
                  src={product.image}
                  className="h-40 w-full object-cover rounded-xl"
                />

                <h2 className="text-sm mt-3 font-medium line-clamp-2 text-gray-800">
                  {product.name}
                </h2>

                <RatingStars productId={product.id} />

                <p className="font-bold text-black mt-2">
                  ₹{product.sellingPrice}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔻 BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 text-xs shadow-inner">
        <a href="/" className="flex flex-col items-center">🏠 Home</a>
        <a href="/categories" className="flex flex-col items-center">📂 Categories</a>
        <a href="/account" className="flex flex-col items-center">👤 Account</a>
        <a href="/cart" className="flex flex-col items-center">🛒 Cart</a>
      </div>
    </>
  );
}
