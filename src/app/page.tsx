"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "T-Shirts",
    "Hoodies",
    "Kids",
    "Accessories",
    "Bags",
  ];

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
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.name
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-24">

        {/* Gradient Search */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
          <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md">
            <input
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <span className="text-gray-500 text-lg">🔍</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto p-4 bg-white">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center min-w-[70px] cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow transition text-xs font-semibold
                ${
                  selectedCategory === cat
                    ? "bg-pink-500 text-white"
                    : "bg-pink-100"
                }`}
              >
                {cat}
              </div>

              <p
                className={`text-xs mt-2 ${
                  selectedCategory === cat
                    ? "text-pink-600 font-semibold"
                    : ""
                }`}
              >
                {cat}
              </p>
            </div>
          ))}
        </div>

        {/* Products */}
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
                  alt={product.name}
                />

                <h2 className="mt-2 text-sm font-medium line-clamp-2">
                  {product.name}
                </h2>

                <p className="text-xs line-through text-gray-400">
                  ₹{product.basePrice}
                </p>

                <p className="text-lg font-bold text-black">
                  ₹{product.finalPrice}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
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
            ))}
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
        <div className="text-center">
          🛒 <br /> Cart
        </div>
      </div>
    </>
  );
}
