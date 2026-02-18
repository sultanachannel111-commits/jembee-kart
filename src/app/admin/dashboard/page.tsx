"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    category: "",
    stock: "",
  });

  /* FETCH PRODUCTS */
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ADD OR UPDATE PRODUCT */
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.image ||
      !form.description ||
      !form.category ||
      !form.stock
    ) {
      setMessage("Please fill all fields ❌");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        });

        setMessage("Product Updated Successfully ✅");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          createdAt: new Date(),
        });

        setMessage("Product Added Successfully ✅");
      }

      setForm({
        name: "",
        price: "",
        image: "",
        description: "",
        category: "",
        stock: "",
      });

      fetchProducts();
    } catch (error) {
      setMessage("Something went wrong ❌");
    }
  };

  /* EDIT */
  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
      stock: product.stock,
    });
  };

  /* DELETE */
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setMessage("Product Deleted 🗑");
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-white p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Seller Admin Panel 💼
        </h1>

        {message && (
          <div className="mb-4 text-purple-700 font-semibold">
            {message}
          </div>
        )}

        {/* ADD PRODUCT FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-10">

          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Product Name"
              className="border p-3 rounded"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price"
              className="border p-3 rounded"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Image URL"
              className="border p-3 rounded"
              value={form.image}
              onChange={(e) =>
                setForm({ ...form, image: e.target.value })
              }
            />

            <select
              className="border p-3 rounded"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Beauty">Beauty</option>
              <option value="Shoes">Shoes</option>
              <option value="Watches">Watches</option>
              <option value="Home">Home</option>
              <option value="Grocery">Grocery</option>
            </select>

            <input
              type="number"
              placeholder="Stock"
              className="border p-3 rounded"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
            />

            <textarea
              placeholder="Product Description"
              className="border p-3 rounded md:col-span-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </div>

        {/* PRODUCT LIST */}
        <div className="space-y-6">

          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="font-semibold text-lg">
                    {product.name}
                  </h2>

                  <p className="text-purple-600 font-bold">
                    ₹{product.price}
                  </p>

                  <p className="text-sm text-gray-600">
                    Category: {product.category}
                  </p>

                  <p className="text-sm text-gray-600">
                    Stock: {product.stock}
                  </p>

                  {product.stock <= 5 && (
                    <p className="text-red-500 text-sm font-semibold">
                      Low Stock ⚠
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {product.createdAt?.toDate
                      ? product.createdAt.toDate().toLocaleString()
                      : ""}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-full"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded-full"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
