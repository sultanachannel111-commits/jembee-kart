"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, addDoc } from "firebase/firestore";
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

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
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

  /* ---------------- ORDER FUNCTION ---------------- */
  const orderOnWhatsApp = async (product: any) => {
    try {
      // 🔥 Save Order in Firestore
      await addDoc(collection(db, "orders"), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        status: "Pending",
        trackingId: "",
        createdAt: new Date(),
      });

      // 🔥 Send Email Alert API
      await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: product.name,
          price: product.price,
        }),
      });

      // 🔥 Open WhatsApp
      const message = `Hello, I want to order ${product.name} - ₹${product.price}`;
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      alert("Order Placed Successfully ✅");
    } catch (error) {
      console.log(error);
      alert("Order Failed ❌");
    }
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

      {/* CATEGORY */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-6 py-4 min-w-max">
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
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <div
            key={product.id}
            className="bg-white p-3 rounded-xl shadow hover:shadow-xl transition"
          >
            <Link href={`/product/${product.id}`}>
              <div className="cursor-pointer">
                <img
                  src={product.image}
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
