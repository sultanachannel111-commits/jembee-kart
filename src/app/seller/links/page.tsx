"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SellerLinksPage() {

  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  // 📦 FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      const snap = await getDocs(collection(db, "products"));

      let data: any[] = [];

      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setProducts(data);
      setLoading(false);
    };

    fetchProducts();

  }, []);

  // 🔥 GENERATE LINK
  const generateLink = async (productId: string) => {

    if (!user) {
      alert("Login required ❌");
      return;
    }

    // 🔑 UNIQUE CODE
    const refCode = `${user.uid}_${productId}`;

    // 🔥 SAVE IN FIRESTORE
    await setDoc(
      doc(db, "affiliateLinks", refCode),
      {
        sellerId: user.uid,
        productId,
        createdAt: new Date()
      },
      { merge: true }
    );

    // 🔗 FINAL LINK
    const link = `${window.location.origin}/product/${productId}?ref=${refCode}`;

    // 📋 COPY
    navigator.clipboard.writeText(link);

    alert("🔥 Link copied!\n" + link);
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-4 space-y-4">

      {/* 🔥 HEADER */}
      <h1 className="text-2xl font-bold">
        Affiliate Links 🔗
      </h1>

      {/* 📦 PRODUCTS */}
      <div className="space-y-3">

        {products.map((p) => (

          <div
            key={p.id}
            className="bg-white p-3 rounded-xl shadow flex justify-between items-center"
          >

            <div>
              <p className="font-medium text-sm">
                {p.name}
              </p>

              <p className="text-xs text-gray-500">
                ₹{p?.variations?.[0]?.sizes?.[0]?.sellPrice}
              </p>
            </div>

            <button
              onClick={() => generateLink(p.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Get Link
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}
