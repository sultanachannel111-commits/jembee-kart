"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({}); // 🔥 ADD
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 🔐 GET USER
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

        console.log("🔥 PRODUCTS:", data);

        setProducts(data);
      } catch (err) {
        console.log("❌ ERROR:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // 🔥 FETCH OFFERS (IMPORTANT)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snap = await getDocs(collection(db, "offers"));

        const data: any = {};

        snap.docs.forEach((doc) => {
          data[doc.id] = doc.data().discount || 0;
        });

        console.log("🔥 OFFERS:", data);

        setOffers(data);
      } catch (err) {
        console.log("❌ OFFER ERROR:", err);
      }
    };

    fetchOffers();
  }, []);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      {products.length === 0 ? (
        <p>No products found ❌</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p: any) => {

            // 🔥 BASE PRICE
            const basePrice =
              p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0;

            // 🔥 OFFER
            const discount = offers[p.id] || 0;

            // 🔥 FINAL PRICE
            const finalPrice = Math.round(
              basePrice - (basePrice * discount) / 100
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

                {/* PRICE */}
                <p className="text-green-600 font-bold">
                  ₹{finalPrice}
                </p>

                {/* 🔥 DISCOUNT TAG */}
                {discount > 0 && (
                  <p className="text-xs text-red-500">
                    {discount}% OFF
                  </p>
                )}

                {/* 🔗 SHARE */}
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Login required ❌");
                      return;
                    }

                    const link = `${window.location.origin}/product/${p.id}?ref=${user.uid}`;

                    navigator.share?.({
                      title: p.name,
                      url: link,
                    });
                  }}
                  className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
                >
                  Share & Earn 💰
                </button>

                {/* 👀 VIEW */}
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
