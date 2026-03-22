"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore";

// 🔥 RANDOM CODE GENERATOR
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

export default function SellerPage() {

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD PRODUCTS
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {

    const snap = await getDocs(collection(db, "products"));

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setProducts(data);
    setLoading(false);
  };

  // 🔗 GENERATE LINK
  const handleGenerateLink = async (product: any) => {

    const user = auth.currentUser;

    if (!user) {
      alert("Login first");
      return;
    }

    const code = generateCode();

    await setDoc(doc(db, "affiliateLinks", code), {
      productId: product.id,
      sellerId: user.uid,
      createdAt: new Date()
    });

    const link = `${window.location.origin}/product/${product.id}?ref=${code}`;

    // 🔥 COPY LINK
    navigator.clipboard.writeText(link);

    alert("✅ Link copied!\n\n" + link);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">
        Seller Panel 💰
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {products.map((product: any) => {

          const image =
            product?.variations?.[0]?.images?.main ||
            product.image ||
            "";

          const sellPrice =
            product?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            product.price ||
            0;

          const basePrice =
            product?.variations?.[0]?.sizes?.[0]?.price ||
            0;

          return (
            <div
              key={product.id}
              className="bg-white p-3 rounded-xl shadow"
            >

              {/* IMAGE */}
              <img
                src={image}
                className="w-full h-32 object-cover rounded"
              />

              {/* NAME */}
              <p className="mt-2 text-sm font-semibold">
                {product.name}
              </p>

              {/* PRICE */}
              <p className="text-green-600 font-bold">
                ₹{sellPrice}
              </p>

              <p className="text-xs text-gray-500">
                Base: ₹{basePrice}
              </p>

              {/* COMMISSION PREVIEW */}
              <p className="text-xs text-blue-600 mt-1">
                Commission: ₹{Math.round((sellPrice - basePrice) * 0.5)}
              </p>

              {/* BUTTON */}
              <button
                onClick={() => handleGenerateLink(product)}
                className="mt-3 w-full bg-black text-white py-2 rounded"
              >
                🔗 Generate Link
              </button>

            </div>
          );

        })}

      </div>

    </div>
  );
}
