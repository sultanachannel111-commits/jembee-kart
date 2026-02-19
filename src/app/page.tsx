"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export default function HomePage() {
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

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* FETCH PRODUCTS */
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

  /* FILTER */
  const filteredProducts = products.filter((product: any) => {
    const matchCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  /* DIRECT QIKINK ORDER */
  const placeOrder = async (product: any) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first 💖");
        return;
      }

      setLoading(true);
      setMessage("Sending order to Qikink... ⏳");

      const response = await fetch("/api/qikink/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: "ORDER" + Date.now(),
          shipping_address: {
            name: user.displayName || "Test Customer",
            address1: "Road No 12A",
            city: "Jamshedpur",
            state: "Jharkhand",
            pincode: "832110",
            country: "India",
            phone: "9999999999",
          },
          order_items: [
            {
              product_id: "63784036", // Temporary test ID
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setMessage("Order Sent to Qikink ✅");
      } else {
        setMessage("Order Failed ❌");
      }

      setLoading(false);

    } catch (error) {
      setLoading(false);
      setMessage("Order Failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white">

      {/* HEADER */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-pink-600">
            JEMBEE KART 💖
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="px-4 py-2 rounded-full border focus:ring-2 focus:ring-pink-400 w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Link href="/auth?role=customer">
              <button className="bg-pink-500 text-white px-4 py-2 rounded-full shadow hover:bg-pink-600 transition">
                Login
              </button>
            </Link>

            <Link href="/auth?role=seller">
              <button className="bg-purple-500 text-white px-4 py-2 rounded-full shadow hover:bg-purple-600 transition">
                Seller
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="text-center mt-4 text-pink-700 font-semibold">
          {message}
        </div>
      )}

      {/* CATEGORY */}
      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {["All", ...categories.map((c) => c.name)].map((catName) => (
            <div
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className="cursor-pointer text-center"
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden shadow-md transition
                ${
                  selectedCategory === catName
                    ? "ring-2 ring-pink-500 scale-110"
                    : "hover:scale-110"
                }`}
              >
                {catName === "All" ? (
                  <div className="flex items-center justify-center h-full text-xl">
                    🛍
                  </div>
                ) : (
                  <img
                    src={
                      categories.find((c) => c.name === catName)?.image
                    }
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-sm mt-2 font-medium">{catName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300"
          >
            <Link href={`/product/${product.id}`}>
              <img
                src={product.image}
                className="h-40 w-full object-cover rounded-xl hover:scale-105 transition"
              />
            </Link>

            <h2 className="mt-3 font-semibold text-gray-700">
              {product.name}
            </h2>

            <p className="text-pink-600 font-bold text-lg">
              ₹{product.price}
            </p>

            <button
              onClick={() => placeOrder(product)}
              disabled={loading}
              className={`mt-3 w-full py-2 rounded-full text-white transition
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                }`}
            >
              {loading ? "Processing..." : "Place Order 💕"}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
