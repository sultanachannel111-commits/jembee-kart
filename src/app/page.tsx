"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/context/CartContext"; // ✅ Added

export default function HomePage() {
  const { addToCart, cartCount } = useCart(); // ✅ Added

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const recognitionRef = useRef<any>(null);

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
          image: product.images?.[0] || "/placeholder.png",
          basePrice: product.product_price,
          finalPrice:
            pricingMap[product.id] ||
            Number(product.product_price) + 150,
        }));

        setProducts(mergedProducts);

        const uniqueCategories = [
          ...new Set(
            mergedProducts.map((p: any) =>
              p.name.split(" ")[0]
            )
          ),
        ];

        const formattedCategories = [
          {
            name: "All",
            image:
              "https://cdn-icons-png.flaticon.com/512/891/891462.png",
          },
          ...uniqueCategories.map((cat: string) => ({
            name: cat,
            image:
              "https://source.unsplash.com/100x100/?" + cat,
          })),
        ];

        setCategories(formattedCategories);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
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
    const normalizedProduct = normalize(product.name);
    const normalizedSearch = normalize(search);

    const matchesSearch =
      normalizedProduct.includes(normalizedSearch);

    return matchesSearch;
  });

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-28">

        {/* Search */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <button
              onClick={startVoiceSearch}
              className="text-gray-500 text-lg mr-2"
            >
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
                  className={`w-16 h-16 rounded-full overflow-hidden border-2
                    ${
                      selectedCategory === cat.name
                        ? "border-pink-500 shadow-lg"
                        : "border-gray-200"
                    }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs mt-2 text-center">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="px-4 py-3">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
              className="w-full h-40 object-cover"
            />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.map((product) => {
              const boughtCount =
                100 + (product.id.charCodeAt(0) % 900);

              return (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-xl shadow hover:shadow-lg"
                >
                  <img
                    src={product.image}
                    className="h-40 w-full object-cover rounded-lg"
                  />

                  <h2 className="mt-2 text-sm font-medium line-clamp-2">
                    {product.name}
                  </h2>

                  <RatingStars productId={product.id} />

                  <p className="text-[11px] text-gray-400 mt-1">
                    {boughtCount}+ bought
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
                        addToCart({
                          id: product.id,
                          name: product.name,
                          image: product.image,
                          price: product.finalPrice,
                          quantity: 1,
                        });

                        setClickedId(product.id);
                        setTimeout(() => setClickedId(null), 300);
                      }}
                      className={`flex-1 py-2 text-sm rounded transition
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
      <div className="fixed bottom-0 w-full bg-white shadow-inner border-t flex justify-around py-2 text-xs">
        <div className="text-center">
          🏠 <br /> Home
        </div>

        <div className="text-center">
          📂 <br /> Categories
        </div>

        <div className="text-center">
          👤 <br /> Account
        </div>

        <div className="text-center relative">
          🛒 <br /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
