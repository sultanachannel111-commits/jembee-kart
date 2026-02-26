"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function AddProduct() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    category: "",
    sku: "",
    printTypeId: "",
    designLink: "",
    mockupLink: "",
    costPrice: "",
    sellingPrice: "",
    stock: "",
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const profit =
    Number(form.sellingPrice || 0) -
    Number(form.costPrice || 0);

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.category ||
      !form.sku ||
      !form.sellingPrice
    ) {
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: form.name,
        category: form.category,
        sku: form.sku,
        printTypeId: Number(form.printTypeId),
        designLink: form.designLink,
        mockupLink: form.mockupLink,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        profit: profit,
        stock: Number(form.stock || 0),
        sold: 0,
        sellerId: user?.uid,
        status: "pending",      // 🔥 Qikink safe flow
        isActive: false,        // 🔥 Not live until admin approves
        createdAt: serverTimestamp(),
      });

      setSuccess(true);

      setForm({
        name: "",
        category: "",
        sku: "",
        printTypeId: "",
        designLink: "",
        mockupLink: "",
        costPrice: "",
        sellingPrice: "",
        stock: "",
      });

      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl p-8">

        <h1 className="text-2xl font-bold mb-6">
          Add Qikink Product
        </h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            Product submitted successfully. Waiting for admin approval.
          </div>
        )}

        <div className="space-y-4">

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="sku"
            placeholder="Qikink SKU"
            value={form.sku}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="printTypeId"
            placeholder="Print Type ID"
            type="number"
            value={form.printTypeId}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="designLink"
            placeholder="Design Image URL"
            value={form.designLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="mockupLink"
            placeholder="Mockup Image URL"
            value={form.mockupLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="costPrice"
            placeholder="Cost Price"
            type="number"
            value={form.costPrice}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="sellingPrice"
            placeholder="Selling Price"
            type="number"
            value={form.sellingPrice}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <input
            name="stock"
            placeholder="Available Stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <div className="bg-pink-100 p-3 rounded">
            Profit: ₹ {profit}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black hover:bg-pink-600 text-white py-3 rounded font-semibold"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </button>

        </div>
      </div>
    </div>
  );
}
