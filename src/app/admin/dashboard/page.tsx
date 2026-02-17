"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import AdminProtect from "@/components/AdminProtect";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

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

  const addProduct = async () => {
    if (!name || !price) return alert("Fill all fields");

    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      image,
      sales: 0,
      createdAt: new Date(),
    });

    setName("");
    setPrice("");
    setImage("");
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const totalSales = products.reduce(
    (acc, p) => acc + (p.sales || 0),
    0
  );

  const totalRevenue = products.reduce(
    (acc, p) => acc + (p.sales || 0) * p.price,
    0
  );

  return (
    <AdminProtect>
      <div className="min-h-screen bg-gray-100 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <p>Total Products</p>
            <h2 className="text-2xl font-bold">
              {products.length}
            </h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Total Sales</p>
            <h2 className="text-2xl font-bold">
              {totalSales}
            </h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Total Revenue</p>
            <h2 className="text-2xl font-bold">
              ₹{totalRevenue}
            </h2>
          </div>
        </div>

        {/* Add Product */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Add Product
          </h2>

          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
          />

          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 mr-2"
          />

          <input
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="border p-2 mr-2"
          />

          <button
            onClick={addProduct}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* Product List */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded shadow"
            >
              <img
                src={product.image}
                className="h-40 w-full object-cover rounded"
              />

              <h3 className="font-bold mt-2">
                {product.name}
              </h3>

              <p>₹{product.price}</p>
              <p>Sales: {product.sales || 0}</p>

              <button
                onClick={() => deleteProduct(product.id)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </AdminProtect>
  );
}
