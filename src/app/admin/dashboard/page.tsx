"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Mobiles");
  const [description, setDescription] = useState("");

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

  /* ---------------- ADD PRODUCT ---------------- */
  const handleAddProduct = async () => {
    if (!name || !price || !image || !category) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      image,
      category,
      description,
      createdAt: new Date(),
    });

    alert("Product Added Successfully");

    setName("");
    setPrice("");
    setImage("");
    setDescription("");

    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ADD PRODUCT */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">

        <h2 className="text-xl font-semibold mb-4">Add Product</h2>

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
          type="text"
          placeholder="Image URL"
          className="w-full border p-3 rounded mb-3"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        {/* CATEGORY */}
        <select
          className="w-full border p-3 rounded mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Mobiles</option>
          <option>Fashion</option>
          <option>Electronics</option>
          <option>Beauty</option>
          <option>Shoes</option>
          <option>Watches</option>
          <option>Home</option>
          <option>Grocery</option>
        </select>

        {/* DESCRIPTION */}
        <textarea
          placeholder="Product Description"
          className="w-full border p-3 rounded mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleAddProduct}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow">
            <img
              src={product.image}
              className="h-40 w-full object-cover rounded mb-3"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-blue-600 font-bold">₹{product.price}</p>
            <p className="text-sm text-gray-500">
              {product.category}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
