"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function AddProduct() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = async () => {
    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      sellerId: user?.uid,
      createdAt: new Date(),
    });

    alert("Product Added ✅");
    setName("");
    setPrice("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <input
        placeholder="Product Name"
        className="border p-2 mb-3 block"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        className="border p-2 mb-3 block"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        onClick={handleAdd}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Product
      </button>
    </div>
  );
}
