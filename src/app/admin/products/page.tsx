"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    printTypeId: "",
    designLink: "",
    mockupLink: "",
    costPrice: "",
    sellingPrice: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const profit =
    Number(form.sellingPrice || 0) - Number(form.costPrice || 0);

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.sellingPrice) {
      alert("Required fields missing");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        ...form,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        profit: profit,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      alert("✅ Product Added Successfully");

      setForm({
        name: "",
        sku: "",
        printTypeId: "",
        designLink: "",
        mockupLink: "",
        costPrice: "",
        sellingPrice: "",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Error adding product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl p-8">

        <h1 className="text-2xl font-bold mb-6 text-black">
          Add Qikink Product
        </h1>

        <div className="space-y-4">

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="sku"
            placeholder="Qikink SKU"
            value={form.sku}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="printTypeId"
            placeholder="Print Type ID (Example: 1)"
            value={form.printTypeId}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="designLink"
            placeholder="Design Image URL"
            value={form.designLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="mockupLink"
            placeholder="Mockup Image URL"
            value={form.mockupLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="costPrice"
            placeholder="Cost Price (Qikink)"
            value={form.costPrice}
            onChange={handleChange}
            type="number"
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            name="sellingPrice"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={handleChange}
            type="number"
            className="w-full border px-4 py-2 rounded-lg"
          />

          <div className="bg-pink-100 p-3 rounded-lg">
            <p className="font-semibold text-black">
              Profit: ₹ {profit}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Add Product
          </button>

        </div>
      </div>
    </div>
  );
}
