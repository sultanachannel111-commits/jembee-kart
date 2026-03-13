"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {

      const snap = await getDocs(collection(db, "products"));

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(list);
      setLoading(false);

    } catch (error) {
      console.log("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        JembeeKart Products
      </h1>

      {loading && <p>Loading products...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        {products.map((p: any) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              background: "#fff"
            }}
          >

            <img
              src={p.image}
              style={{
                width: "100%",
                borderRadius: "8px"
              }}
            />

            <h3 style={{ fontSize: "16px", marginTop: "10px" }}>
              {p.name}
            </h3>

            <p style={{ fontWeight: "bold" }}>
              ₹{p.price}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}
