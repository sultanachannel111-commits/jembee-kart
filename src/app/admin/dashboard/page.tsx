"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Mobiles");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  /* ---------------- ADD / UPDATE PRODUCT ---------------- */
  const handleSaveProduct = async () => {
    if (!name || !price || !image || !stock) {
      alert("Fill all fields");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "products", editingId), {
        name,
        price: Number(price),
        image,
        category,
        description,
        stock: Number(stock),
      });
      alert("Product Updated");
      setEditingId(null);
    } else {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        image,
        category,
        description,
        stock: Number(stock),
        sales: 0,
        createdAt: new Date(),
      });
      alert("Product Added");
    }

    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage("");
    setDescription("");
    setStock("");
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    alert("Deleted Successfully");
    fetchProducts();
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setImage(product.image);
    setCategory(product.category);
    setDescription(product.description);
    setStock(product.stock);
  };

  /* ---------------- ANALYTICS ---------------- */
  const totalProducts = products.length;
  const totalSales = products.reduce(
    (sum, p) => sum + (p.sales || 0),
    0
  );
  const totalRevenue = products.reduce(
    (sum, p) => sum + (p.sales || 0) * (p.price || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* 📊 ANALYTICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Products</h3>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Sales</h3>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Revenue</h3>
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
        </div>
      </div>

      {/* 📦 ADD / EDIT PRODUCT */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <input
          type="text"
          placeholder="Product Name"
          className="w-full border p-3 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border p-3 rounded mb-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-3 rounded mb-3"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <input
          type="text"
          placeholder="Image URL"
          className="w-full border p-3 rounded mb-3"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded mb-3"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSaveProduct}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* 🛒 PRODUCT LIST */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow">

            <img
              src={product.image}
              className="h-40 w-full object-cover rounded mb-3"
            />

            <h3 className="font-semibold">{product.name}</h3>
            <p>₹{product.price}</p>
            <p>Stock: {product.stock}</p>
            <p>Sales: {product.sales || 0}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
