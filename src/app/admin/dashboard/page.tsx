"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    qikinkProductId: "",
    costPrice: "",
    sellingPrice: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sellingPrice) {
      alert("Product Name aur Selling Price required hai");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        qikinkProductId: form.qikinkProductId,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        isActive: true,
        sellerId: "admin",
        createdAt: serverTimestamp(),
      });

      alert("✅ Product Added Successfully");

      setForm({
        name: "",
        description: "",
        imageUrl: "",
        qikinkProductId: "",
        costPrice: "",
        sellingPrice: "",
      });

    } catch (error) {
      console.error(error);
      alert("❌ Error adding product");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Product Dashboard 🛍️</h1>

      <input
        name="name"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
      /><br /><br />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      /><br /><br />

      <input
        name="imageUrl"
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={handleChange}
      /><br /><br />

      <input
        name="qikinkProductId"
        placeholder="Qikink Product ID"
        value={form.qikinkProductId}
        onChange={handleChange}
      /><br /><br />

      <input
        name="costPrice"
        placeholder="Cost Price"
        value={form.costPrice}
        onChange={handleChange}
      /><br /><br />

      <input
        name="sellingPrice"
        placeholder="Selling Price"
        value={form.sellingPrice}
        onChange={handleChange}
      /><br /><br />

      <button onClick={handleSubmit}>
        Add Product
      </button>
    </div>
  );
}
