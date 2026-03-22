"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔥 FETCH ALL PRODUCTS (IMPORTANT FIX)
  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 🔗 SHARE FUNCTION
  const handleShare = (id: string) => {
    if (!user) return alert("Login first");

    const link = `${window.location.origin}/product/${id}?ref=${user.uid}`;

    navigator.share?.({
      title: "Check this product",
      url: link,
    });
  };

  // 📋 COPY LINK
  const handleCopy = (id: string) => {
    if (!user) return alert("Login first");

    const link = `${window.location.origin}/product/${id}?ref=${user.uid}`;

    navigator.clipboard.writeText(link);
    alert("Link copied ✅");
  };

  // 📲 WHATSAPP SHARE
  const handleWhatsApp = (id: string) => {
    if (!user) return alert("Login first");

    const link = `${window.location.origin}/product/${id}?ref=${user.uid}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">All Products</h1>

      <div className="grid grid-cols-2 gap-4">
        {products.map((p: any) => {
          const price =
            p?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            p?.price ||
            0;

          const image =
            p?.variations?.[0]?.images?.main ||
            p?.image ||
            "";

          return (
            <div
              key={p.id}
              className="bg-white p-3 rounded-xl shadow"
            >
              {/* IMAGE */}
              <img
                src={image}
                className="h-40 w-full object-cover rounded"
              />

              {/* NAME */}
              <p className="text-sm mt-2 line-clamp-2">
                {p.name}
              </p>

              {/* PRICE */}
              <p className="text-green-600 font-bold">
                ₹{price}
              </p>

              {/* BUTTONS */}
              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => handleShare(p.id)}
                  className="bg-blue-600 text-white py-1 rounded"
                >
                  Share
                </button>

                <button
                  onClick={() => handleWhatsApp(p.id)}
                  className="bg-green-500 text-white py-1 rounded"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => handleCopy(p.id)}
                  className="border py-1 rounded"
                >
                  Copy Link
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
