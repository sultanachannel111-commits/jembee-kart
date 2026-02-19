"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/header";
import { ShoppingCart } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 pb-24">

        {/* Search Bar */}
        <div className="p-4 bg-white shadow">
          <input
            type="text"
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-full px-4 py-2 outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto p-4 bg-white">
          {["T-Shirts", "Hoodies", "Kids", "Accessories", "Bags"].map(
            (cat) => (
              <div
                key={cat}
                className="min-w-[80px] text-center bg-gray-200 rounded-full py-2 px-3 text-sm"
              >
                {cat}
              </div>
            )
          )}
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

                <h2 className="mt-2 text-sm font-medium">
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
            ))}
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-inner border-t flex justify-around py-2">
        <div className="text-center text-xs">
          🏠 <br /> Home
        </div>
        <div className="text-center text-xs">
          📂 <br /> Categories
        </div>
        <div className="text-center text-xs">
          👤 <br /> Account
        </div>
        <div className="text-center text-xs">
          🛒 <br /> Cart
        </div>
      </div>
    </>
  );
}
