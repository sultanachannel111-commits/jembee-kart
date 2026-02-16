"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const whatsappNumber = "917061369212";

  /* ---------------- CATEGORIES ---------------- */
  const categories = [
    { name: "Mobiles", image: "https://img.icons8.com/color/96/iphone.png" },
    { name: "Fashion", image: "https://img.icons8.com/color/96/t-shirt.png" },
    { name: "Electronics", image: "https://img.icons8.com/color/96/laptop.png" },
    { name: "Beauty", image: "https://img.icons8.com/color/96/lipstick.png" },
    { name: "Shoes", image: "https://img.icons8.com/color/96/running-shoe.png" },
    { name: "Watches", image: "https://img.icons8.com/color/96/apple-watch.png" },
    { name: "Home", image: "https://img.icons8.com/color/96/sofa.png" },
    { name: "Grocery", image: "https://img.icons8.com/color/96/shopping-basket.png" },
  ];

  /* ---------------- PRODUCTS ---------------- */
  const products = [
    {
      id: 1,
      name: "iPhone 14",
      price: 69999,
      category: "Mobiles",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    },
    {
      id: 2,
      name: "Running Shoes",
      price: 1999,
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    },
    {
      id: 3,
      name: "Smart Watch",
      price: 2499,
      category: "Watches",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    },
    {
      id: 4,
      name: "T-Shirt",
      price: 799,
      category: "Fashion",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    },
  ];

  /* ---------------- STATES ---------------- */
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bannerIndex, setBannerIndex] = useState(0);

  /* ---------------- BANNER SLIDER ---------------- */
  const banners = [
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  /* ---------------- WHATSAPP ---------------- */
  const orderOnWhatsApp = (productName: string) => {
    const message = `Hello, I want to order ${productName}`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="bg-yellow-400 p-4 shadow flex items-center justify-between">
        <h1 className="font-bold text-xl">JEMBEE KART</h1>

        <input
          type="text"
          placeholder="Search products..."
          className="px-4 py-2 rounded w-1/2 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* BANNER SLIDER */}
      <div className="p-4">
        <img
          src={banners[bannerIndex]}
          className="w-full h-48 md:h-72 object-cover rounded-xl transition-all duration-700"
        />
      </div>

      {/* CATEGORY ROW */}
      <div className="px-4 overflow-x-auto">
        <div className="flex gap-6 py-4 min-w-max">
          <div
            onClick={() => setSelectedCategory("All")}
            className="cursor-pointer text-center hover:scale-110 transition"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              🛍
            </div>
            <p className="text-sm mt-2">All</p>
          </div>

          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => setSelectedCategory(cat.name)}
              className="cursor-pointer text-center hover:scale-110 transition"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl">
                <img src={cat.image} className="w-8 h-8" />
              </div>
              <p className="text-sm mt-2">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-3 rounded-xl shadow hover:shadow-xl hover:scale-105 transition duration-300"
          >
            <img
              src={product.image}
              className="h-40 w-full object-cover rounded-lg"
            />

            <h2 className="mt-2 font-semibold">{product.name}</h2>
            <p className="text-blue-600 font-bold">₹{product.price}</p>

            <button
              onClick={() => orderOnWhatsApp(product.name)}
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
