"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOffersPage() {
  const [type, setType] = useState("category");
  const [category, setCategory] = useState("");
  const [productId, setProductId] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [endDate, setEndDate] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "offers"), snap =>
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsub2 = onSnapshot(collection(db, "categories"), snap =>
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsub3 = onSnapshot(collection(db, "products"), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const addOffer = async () => {
    setError("");

    if (!discount) return setError("Enter discount");
    if (!endDate) return setError("Select end time");

    if (type === "category" && !category)
      return setError("Select category");

    if (type === "product" && !productId)
      return setError("Select product");

    await addDoc(collection(db, "offers"), {
      type,
      category: type === "category" ? category : null,
      productId: type === "product" ? productId : null,
      discount: Number(discount),
      endDate,
      active: true,
      createdAt: new Date(),
    });

    setCategory("");
    setProductId("");
    setDiscount("");
    setEndDate("");
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "offers", id), {
      active: !current,
    });
  };

  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, "offers", id));
  };

  const getRemaining = (end: string) => {
    const diff = new Date(end).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Offer Management
      </h1>

      <div className="grid md:grid-cols-6 gap-3 mb-4">

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="category">Category Offer</option>
          <option value="product">Product Offer</option>
        </select>

        {type === "category" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {type === "product" && (
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Discount %"
          value={discount}
          onChange={(e) =>
            setDiscount(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          className="border px-3 py-2 rounded"
        />

        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={addOffer}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {offers.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">
              {o.type === "category"
                ? `Category: ${o.category}`
                : `Product ID: ${o.productId}`}
            </p>
            <p className="text-pink-600 font-bold">
              {o.discount}% OFF
            </p>
            <p className="text-sm">
              Ends: {getRemaining(o.endDate)}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  toggleActive(o.id, o.active)
                }
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                {o.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteOffer(o.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
