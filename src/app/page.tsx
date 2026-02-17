"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const whatsappNumber = "917061369212";

  /* ---------------- CATEGORIES ---------------- */
  const categories = [
    { name: "Mobiles", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80" },
    { name: "Electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" },
    { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80" },
    { name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80" },
    { name: "Home", image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=200&q=80" },
    { name: "Grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80" },
  ];

  /* ---------------- STATES ---------------- */
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bannerIndex, setBannerIndex] = useState(0);

  /* ---------------- BANNERS ---------------- */
  const banners = [
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  ];

  /* ---------------- AUTO SLIDER ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    };

    fetchProducts();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredProducts = products.filter((product: any) => {
    const matchCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  /* ---------------- WHATSAPP ---------------- */
  const orderOnWhatsApp = (product: any) => {
    const message = `Hello, I want to order ${product.name} - ₹${product.price}`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen">

      {/* HEADER */}
      <div className="bg-yellow-400 px-4 py-3 shadow sticky top-0 z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">

          <h1 className="font-bold text-xl md:text-2xl">
            JEMBEE KART
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">

            <input
              type="text"
              placeholder="Search for products..."
              className="px-4 py-2 rounded w-full md:w-72 outline-none shadow-sm focus:ring-2 focus:ring-yellow-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Link href="/auth?role=customer">
              <button className="bg-white px-4 py-2 rounded shadow hover:bg-gray-100 transition">
                Login
              </button>
            </Link>

            <Link href="/auth?role=seller">
              <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                Seller
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="max-w-7xl mx-auto p-4">
        <img
          src={banners[bannerIndex]}
          className="w-full h-52 md:h-80 object-cover rounded-xl"
        />
      </div>

      {/* CATEGORY */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-6 py-4 min-w-max">
          {["All", ...categories.map((c) => c.name)].map((catName) => {
            const cat = categories.find((c) => c.name === catName);

            return (
              <div
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className="cursor-pointer text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden shadow-md transition
                  ${
                    selectedCategory === catName
                      ? "ring-2 ring-yellow-500 scale-110"
                      : "hover:scale-110"
                  }`}
                >
                  {catName === "All" ? (
                    <div className="flex items-center justify-center h-full text-xl">
                      🛍
                    </div>
                  ) : (
                    <img
                      src={cat?.image}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm mt-2 font-medium">{catName}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <div
            key={product.id}
            className="bg-white p-3 rounded-xl shadow hover:shadow-xl transition"
          >
            <Link href={`/products/${product.id}`}>
              <div className="cursor-pointer">
                <img
                  src={product.image || "/placeholder.png"}
                  className="h-40 w-full object-cover rounded-lg hover:scale-105 transition"
                />

                <h2 className="mt-2 font-semibold">
                  {product.name}
                </h2>

                <p className="text-blue-600 font-bold">
                  ₹{product.price}
                </p>
              </div>
            </Link>

            <button
              onClick={() => orderOnWhatsApp(product)}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              Order on WhatsApp
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
