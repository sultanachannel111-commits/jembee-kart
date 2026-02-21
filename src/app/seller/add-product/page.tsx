"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function AddProduct() {
  const { user } = useAuth();

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
    Number(form.sellingPrice || 0) -
    Number(form.costPrice || 0);

  const handleAdd = async () => {
    if (!form.name || !form.sku || !form.sellingPrice) {
      alert("Required fields missing");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name: form.name,
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
    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Add Qikink Product
      </h1>

      <div className="space-y-4">

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
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
          placeholder="Cost Price (Qikink)"
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

        <div className="bg-pink-100 p-3 rounded">
          <p className="font-semibold">
            Profit: ₹ {profit}
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-black hover:bg-pink-600 text-white py-3 rounded font-semibold"
        >
          Submit Product
        </button>

      </div>
    </div>
  );
}
