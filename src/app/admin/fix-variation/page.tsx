"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FixVariationPage() {
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);

  const fixVariation = async () => {
    if (!productId) {
      alert("Enter Product ID");
      return;
    }

    setLoading(true);

    try {
      await updateDoc(doc(db, "products", productId), {
        variations: [
          {
            color: "#ff0000",
            size: "S",
            price: 699,
            stock: 10,
            images: ["https://via.placeholder.com/300"]
          }
        ]
      });

      alert("✅ Variation Fixed Successfully 🔥");
    } catch (error) {
      console.log(error);
      alert("❌ Error fixing variation");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Fix Product Variation 🔧
        </h1>

        <input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          onClick={fixVariation}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {loading ? "Fixing..." : "Fix Variation"}
        </button>

      </div>
    </div>
  );
}
