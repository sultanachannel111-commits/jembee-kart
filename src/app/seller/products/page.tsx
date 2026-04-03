"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function SellerProductsPage() {

  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  // 🔐 USER
  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);
  }, []);

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      } catch (err) {
        console.log("❌ PRODUCT ERROR:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 🔥 FETCH OFFERS
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snap = await getDocs(collection(db, "offers"));

        const data: any = {};

        snap.docs.forEach((doc) => {
          const d: any = doc.data();

          if (d.productId && d.active) {
            data[d.productId] = d.discount || 0;
          }
        });

        setOffers(data);
      } catch (err) {
        console.log("❌ OFFER ERROR:", err);
      }
    };

    fetchOffers();
  }, []);

  // 🔥 STORE SHARE LINK
  const storeLink =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/store/${user.uid}`
      : "";

  const shareStore = () => {
    if (!user) return alert("Login required ❌");

    const text = `🔥 Check all my products & earn money\n${storeLink}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const copyStore = () => {
    navigator.clipboard.writeText(storeLink);
    alert("Store link copied ✅");
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4">

      {/* 🔥 ALL STORE SHARE (TOP) */}
      {user && (
        <div className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow mb-5">

          <h2 className="text-lg font-bold mb-2">
            🚀 Share Full Store
          </h2>

          <div className="flex gap-2">

            <button
              onClick={shareStore}
              className="flex-1 bg-green-500 text-white py-2 rounded-xl"
            >
              WhatsApp
            </button>

            <button
              onClick={copyStore}
              className="flex-1 bg-black text-white py-2 rounded-xl"
            >
              Copy Link
            </button>

          </div>

        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">
        All Products
      </h1>

      {products.length === 0 ? (
        <p>No products found ❌</p>
      ) : (

        <div className="grid grid-cols-2 gap-4">

          {products.map((p: any) => {

            // 🔥 BASE PRICE (hidden)
            const basePrice =
              p?.variations?.[0]?.sizes?.[0]?.price || 0;

            // 🔥 SELL PRICE
            const sellPrice =
              p?.variations?.[0]?.sizes?.[0]?.sellPrice || basePrice;

            // 🔥 OFFER
            const discount = offers[p.id] ?? 0;

            // 🔥 FINAL PRICE
            const finalPrice = Math.round(
              sellPrice - (sellPrice * discount) / 100
            );

            return (
              <div
                key={p.id}
                className="bg-white p-3 rounded-xl shadow"
              >

                {/* IMAGE */}
                <img
                  src={p?.variations?.[0]?.images?.main}
                  className="h-32 w-full object-cover rounded"
                />

                {/* NAME */}
                <p className="text-sm font-semibold mt-2">
                  {p.name}
                </p>

                {/* FINAL PRICE */}
                <p className="text-green-600 font-bold">
                  ₹{finalPrice}
                </p>

                {/* OLD PRICE */}
                {discount > 0 && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹{sellPrice}
                  </p>
                )}

                {/* DISCOUNT */}
                {discount > 0 && (
                  <p className="text-xs text-red-500 font-semibold">
                    {discount}% OFF 🔥
                  </p>
                )}

                {/* SHARE */}
                <button
                  onClick={() => {

                    if (!user) {
                      alert("Login required ❌");
                      return;
                    }

                    const link = `${window.location.origin}/product/${p.id}?ref=${user.uid}`;

                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        p.name + " 🔥\n" + link
                      )}`
                    );

                  }}
                  className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
                >
                  Share & Earn 💰
                </button>

                {/* VIEW */}
                <button
                  onClick={() => router.push(`/product/${p.id}`)}
                  className="mt-2 w-full border py-1 rounded"
                >
                  View
                </button>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
