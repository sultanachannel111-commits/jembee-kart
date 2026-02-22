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
  });

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
        sellerId: user?.uid,
        status: "pending", // admin approval
        isActive: false,
        createdAt: serverTimestamp(),
      });

      alert("✅ Product Submitted For Admin Approval");

      setForm({
        name: "",
        category: "",
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

        <h1 className="text-2xl font-bold mb-6">
          Add Qikink Product
        </h1>

        <div className="space-y-4">

          {/* Product Name */}
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Qikink Category */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Qikink Category</option>
            <option value="New Products">New Products</option>
            <option value="Best Sellers">Best Sellers</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Hoodies & Jackets">Hoodies & Jackets</option>
            <option value="AOP Apparel">AOP Apparel</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Kids Clothing">Kids Clothing</option>
            <option value="Headwear">Headwear</option>
            <option value="Drinkware">Drinkware</option>
            <option value="Accessories">Accessories</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Pet-Wear">Pet-Wear</option>
            <option value="Bags">Bags</option>
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
            placeholder="Print Type ID (Example: 1)"
            type="number"
            value={form.printTypeId}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Design URL */}
          <input
            name="designLink"
            placeholder="Design Image URL"
            value={form.designLink}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* Mockup URL */}
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

          {/* Profit */}
          <div className="bg-pink-100 p-3 rounded">
            <p className="font-semibold">
              Profit: ₹ {profit}
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-pink-600 text-white py-3 rounded font-semibold"
          >
            Submit Product
          </button>

        </div>
      </div>
    </div>
  );
}
