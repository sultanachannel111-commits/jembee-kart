"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 🔥 Voice
  const recognitionRef = useRef<any>(null);

  // 🔥 Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const sliderData = [
    {
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000",
      title: "MEGA SALE",
      subtitle: "BEST DEALS TODAY",
    },
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000",
      title: "TRENDING FASHION",
      subtitle: "NEW ARRIVALS",
    },
    {
      image:
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=1000",
      title: "LIMITED OFFER",
      subtitle: "UP TO 60% OFF",
    },
  ];

  const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  // 🎤 Voice Search
  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript);
    };

    recognitionRef.current = recognition;
  };

  // 📦 Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/qikink/products");
      const qikinkData = await res.json();

      const pricingSnap = await getDocs(collection(db, "productPricing"));
      const pricingMap: any = {};
      pricingSnap.forEach((doc) => {
        pricingMap[doc.id] = doc.data().sellingPrice;
      });

      const merged = qikinkData.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0],
        basePrice: p.product_price,
        finalPrice:
          pricingMap[p.id] || Number(p.product_price) + 150,
      }));

      setProducts(merged);

      const unique = [
        ...new Set(merged.map((p: any) => p.name.split(" ")[0])),
      ];

      setCategories([
        {
          name: "All",
          image:
            "https://cdn-icons-png.flaticon.com/512/891/891462.png",
        },
        ...unique.map((cat: string) => ({
          name: cat,
          image:
            "https://source.unsplash.com/100x100/?" + cat,
        })),
      ]);

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 🔁 Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliderData.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter((p) =>
    normalize(p.name).includes(normalize(search))
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-28">

        {/* 🔍 Search */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 outline-none text-sm"
            />
            <button onClick={startVoiceSearch} className="mr-2">
              🎤
            </button>
            🔍
          </div>
        </div>

        {/* 🟣 Categories */}
        <div className="bg-white py-4 px-4">
          <div className="flex gap-5 overflow-x-auto">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center min-w-[80px]"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border">
                  <img
                    src={cat.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs mt-2">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 Slider */}
        <div className="px-4 py-4">
          <div className="relative overflow-hidden rounded-xl shadow-md h-36 md:h-52">
            <div
              className="flex transition-transform duration-700"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {sliderData.map((slide, i) => (
                <div
                  key={i}
                  className="w-full h-36 md:h-52 flex-shrink-0 relative"
                >
                  <img
                    src={slide.image}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center pl-6 text-white">
                    <h2 className="text-lg font-bold">
                      {slide.title}
                    </h2>
                    <p>{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🛍 Products */}
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product) => (
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

                <p className="line-through text-xs text-gray-400">
                  ₹{product.basePrice}
                </p>

                <p className="font-bold text-lg">
                  ₹{product.finalPrice}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.finalPrice,
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

      {/* 🔻 Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2 text-xs">
        <a href="/" className="flex flex-col items-center">
          🏠 Home
        </a>

        <a href="/categories" className="flex flex-col items-center">
          📂 Category
        </a>

        <a href="/account" className="flex flex-col items-center">
          👤 Account
        </a>

        <a href="/cart" className="flex flex-col items-center relative">
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
