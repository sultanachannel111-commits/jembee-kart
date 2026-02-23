"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QikinkTestPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Safe toggle check
  const isEnabled =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_QIKINK_TEST === "true";

  useEffect(() => {
    if (!isEnabled) return;

    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [isEnabled]);

  if (!isEnabled) {
    return (
      <div className="p-10 text-red-500 font-bold">
        Access Disabled
      </div>
    );
  }

  const handleTest = async () => {
    if (!productId) return alert("Select product");

    setLoading(true);

    const res = await fetch("/api/qikink-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        size,
        color,
        quantity,
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Qikink Sandbox Test Panel
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.qikinkProductId}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        />

      </div>

      <button
        onClick={handleTest}
        className="bg-pink-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Sandbox Order"}
      </button>

      {result && (
        <pre className="mt-6 bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
