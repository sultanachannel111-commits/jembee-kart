"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [qikinkProductId, setQikinkProductId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const handleSubmit = async () => {
    if (!name || !sellingPrice) {
      alert("Name aur Selling Price required hai");
      return;
    }

    await addDoc(collection(db, "products"), {
      name,
      description,
      imageUrl,
      qikinkProductId,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      isActive: true,
      sellerId: "admin",
      createdAt: serverTimestamp(),
    });

    alert("Product Added Successfully ✅");

    setName("");
    setDescription("");
    setImageUrl("");
    setQikinkProductId("");
    setCostPrice("");
    setSellingPrice("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard 🛍️</h1>

      <input placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)} /><br /><br />

      <input placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)} /><br /><br />

      <input placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)} /><br /><br />

      <input placeholder="Qikink Product ID"
        value={qikinkProductId}
        onChange={(e) => setQikinkProductId(e.target.value)} /><br /><br />

      <input placeholder="Cost Price"
        value={costPrice}
        onChange={(e) => setCostPrice(e.target.value)} /><br /><br />

      <input placeholder="Selling Price"
        value={sellingPrice}
        onChange={(e) => setSellingPrice(e.target.value)} /><br /><br />

      <button onClick={handleSubmit}>
        Add Product
      </button>
    </div>
  );
}
