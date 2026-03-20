"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {

  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.log("❌ ID missing");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          console.log("❌ Product not found");
          setLoading(false);
          return;
        }

        const data = {
          id: snap.id,
          ...snap.data()
        };

        console.log("✅ PRODUCT DATA:", data);

        setProduct(data);
        setLoading(false);

      } catch (err) {
        console.log("🔥 ERROR:", err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ LOADING
  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // ❌ NO PRODUCT
  if (!product) {
    return <div style={{ padding: 20 }}>Product not found</div>;
  }

  // ✅ SUCCESS TEST
  return (
    <div style={{ padding: 20 }}>
      <h1>✅ TEST OK</h1>

      <p><b>ID:</b> {id}</p>
      <p><b>Name:</b> {product?.name}</p>
      <p><b>Price:</b> ₹{product?.sellPrice}</p>
      <p><b>Stock:</b> {product?.stock}</p>

      <img
        src={product?.image}
        style={{ width: 200, marginTop: 20 }}
      />

      <pre style={{ marginTop: 20 }}>
        {JSON.stringify(product, null, 2)}
      </pre>
    </div>
  );
}
