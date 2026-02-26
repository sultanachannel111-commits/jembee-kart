"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function AddProduct() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    categoryId: "",
    sku: "",
    printTypeId: "",
    description: "",
    designLink: "",
    mockupLink: "",
    costPrice: "",
    sellingPrice: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* 🔥 FETCH QIKINK CATEGORIES */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "qikinkCategories"),
      (snap) => {
        setCategories(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );

    return () => unsub();
  }, []);

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
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: form.name,
        category: form.category,
        categoryId: Number(form.categoryId),
        sku: form.sku,
        printTypeId: Number(form.printTypeId),
        description: form.description,
        designLink: form.designLink,
        mockupLink: form.mockupLink,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        profit: profit,
        stock: Number(form.stock || 0),
        sold: 0,
        sellerId: user?.uid,

        // 🔥 Admin Approval System
        status: "pending",
        isActive: false,
        approvedAt: null,
        rejectedAt: null,
        rejectReason: "",

        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setLoading(false);

      setForm({
        name: "",
        category: "",
        categoryId: "",
        sku: "",
        printTypeId: "",
        description: "",
        designLink: "",
        mockupLink: "",
        costPrice: "",
        sellingPrice: "",
        stock: "",
      });

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error submitting product");
    }
  };

  const handleCategoryChange = (e: any) => {
    const selected = categories.find(
      (cat) => cat.name === e.target.value
    );

    setForm({
      ...form,
      category: selected?.name || "",
      categoryId: selected?.categoryId || "",
    });
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

          {/* Product Name */}
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* 🔥 Qikink Dynamic Category */}
          <select
            value={form.category}
            onChange={handleCategoryChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Qikink Category</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* SKU */}
          <input
            name="sku"
            placeholder="Qikink SKU"
            value={form.sku}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Print Type */}
          <input
            name="printTypeId"
            placeholder="Print Type ID"
            type="number"
            value={form.printTypeId}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Design Link */}
          <input
            name="designLink"
            placeholder="Design Image URL"
            value={form.designLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Mockup Link */}
          <input
            name="mockupLink"
            placeholder="Mockup Image URL"
            value={form.mockupLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Cost Price */}
          <input
            name="costPrice"
            placeholder="Cost Price (Qikink)"
            type="number"
            value={form.costPrice}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Selling Price */}
          <input
            name="sellingPrice"
            placeholder="Selling Price"
            type="number"
            value={form.sellingPrice}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Stock */}
          <input
            name="stock"
            placeholder="Available Stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Profit */}
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
