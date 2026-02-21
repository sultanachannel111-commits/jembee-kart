"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/providers/cart-provider";

export default function HomePage() {
  const { addToCart, items } = useCart();
  const cartCount = items.length;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

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

  /* 🔥 FETCH PRODUCTS */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const firestoreProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(firestoreProducts);

        const uniqueCategories = [
          ...new Set(
            firestoreProducts.map((p: any) =>
              p.name ? p.name.split(" ")[0] : "Other"
            )
          ),
        ];

        setCategories([
          {
            name: "All",
            image:
              "https://cdn-icons-png.flaticon.com/512/891/891462.png",
          },
          ...uniqueCategories.map((cat: string) => ({
            name: cat,
            image: "https://source.unsplash.com/100x100/?" + cat,
          })),
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Firestore fetch error:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* 🔁 AUTO SLIDER */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliderData.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter((p: any) =>
    normalize(p.name || "").includes(normalize(search))
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
            🔍
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

      {/* 🔻 Bottom Nav */}
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
