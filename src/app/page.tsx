"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { Home, LayoutGrid, User, ShoppingCart } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentBanner, setCurrentBanner] = useState(0);
  const recognitionRef = useRef<any>(null);

  const banners = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1400&auto=format&fit=crop",
  ];

  const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/qikink/products");
        const qikinkData = await res.json();

        const pricingSnap = await getDocs(collection(db, "productPricing"));
        const pricingMap: any = {};
        pricingSnap.forEach((doc) => {
          pricingMap[doc.id] = doc.data().sellingPrice;
        });

        const mergedProducts = qikinkData.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category || product.name.split(" ")[0],
          image: product.images?.[0] || "/placeholder.png",
          basePrice: product.product_price,
          finalPrice:
            pricingMap[product.id] ||
            Number(product.product_price) + 150,
        }));

        setProducts(mergedProducts);

        const unique = [...new Set(mergedProducts.map(p => p.category))];

        const formatted = [
          {
            name: "All",
            image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
          },
          ...unique.map((cat: string) => ({
            name: cat,
            image: `https://source.unsplash.com/100x100/?${cat}`,
          })),
        ];

        setCategories(formatted);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Banner Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript);
    };

    recognitionRef.current = recognition;
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch =
      normalize(product.name).includes(normalize(search));

    const matchCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#f1f3f6] pb-28">

        {/* Search */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <button onClick={startVoiceSearch} className="mr-2">
              🎤
            </button>
            🔍
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white py-4 px-4">
          <div className="flex gap-5 overflow-x-auto">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center min-w-[80px] cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 transition
                  ${
                    selectedCategory === cat.name
                      ? "border-pink-500 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={cat.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p
                  className={`text-xs mt-2 ${
                    selectedCategory === cat.name
                      ? "text-pink-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* HD Banner Slider */}
        <div className="px-4 py-4">
          <div className="relative rounded-xl overflow-hidden shadow h-52">
            <div
              className="flex transition-transform duration-700"
              style={{
                transform: `translateX(-${currentBanner * 100}%)`,
              }}
            >
              {banners.map((banner, index) => (
                <img
                  key={index}
                  src={banner}
                  className="w-full h-52 object-cover flex-shrink-0"
                />
              ))}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentBanner === index
                      ? "bg-white"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-3 rounded-xl animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product) => {
              const bought =
                100 + (product.id.charCodeAt(0) % 900);

              return (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-xl shadow"
                >
                  <img
                    src={product.image}
                    className="h-40 w-full object-cover rounded-lg"
                  />

                  <h2 className="mt-2 text-sm font-medium line-clamp-2">
                    {product.name}
                  </h2>

                  <RatingStars productId={product.id} />

                  <p className="text-xs text-gray-400">
                    {bought}+ bought
                  </p>

                  <p className="text-xs line-through text-gray-400">
                    ₹{product.basePrice}
                  </p>

                  <p className="text-lg font-bold">
                    ₹{product.finalPrice}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setClickedId(product.id);
                        setTimeout(() => setClickedId(null), 300);
                      }}
                      className={`flex-1 py-2 text-sm rounded
                      ${
                        clickedId === product.id
                          ? "bg-gray-400 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      Add to Cart
                    </button>

                    <button className="flex-1 py-2 text-sm bg-orange-500 text-white rounded">
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t shadow-md flex justify-around py-2">
        <div className="flex flex-col items-center text-xs text-gray-600">
          <Home size={20} />
          Home
        </div>
        <div className="flex flex-col items-center text-xs text-gray-600">
          <LayoutGrid size={20} />
          Categories
        </div>
        <div className="flex flex-col items-center text-xs text-gray-600">
          <User size={20} />
          Account
        </div>
        <div className="flex flex-col items-center text-xs text-gray-600">
          <ShoppingCart size={20} />
          Cart
        </div>
      </div>
    </>
  );
}
