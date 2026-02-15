"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { addDoc, collection, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchProducts() {
    if (!db) return;
    const snapshot = await getDocs(collection(db, "products"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleAddProduct(e: any) {
    e.preventDefault();
    if (!db) return;

    setLoading(true);

    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      imageUrl,
      description,
      sellerId: "admin",
      createdAt: serverTimestamp(),
    });

    setName("");
    setPrice("");
    setImageUrl("");
    setDescription("");
    setLoading(false);

    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* ADD PRODUCT FORM */}
        <form onSubmit={handleAddProduct} className="space-y-4 mb-10">

          <input
            className="w-full border p-2 rounded"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border p-2 rounded"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {/* PRODUCT LIST */}
        <h2 className="text-2xl font-bold mb-4">All Products</h2>

        {products.map((product: any) => (
          <div key={product.id} className="border p-4 mb-4 rounded">
            <p><strong>{product.name}</strong></p>
            <p>Price: ${product.price}</p>
            <button
              onClick={() => handleDelete(product.id)}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}
