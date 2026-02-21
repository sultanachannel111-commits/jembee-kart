"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(list);
  };

  const addProduct = async () => {
    if (!name || !price) return;

    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      stock: Number(stock),
      createdAt: new Date(),
    });

    setName("");
    setPrice("");
    setStock("");
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const toggleStock = async (id: string, currentStock: number) => {
    await updateDoc(doc(db, "products", id), {
      stock: currentStock > 0 ? 0 : 10,
    });
    fetchProducts();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products Management 👕</h1>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Product Name"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Price"
            type="number"
            className="border p-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            placeholder="Stock"
            type="number"
            className="border p-2 rounded"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <button
            onClick={addProduct}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{product.name}</p>
              <p>₹{product.price}</p>
              <p>
                Stock:{" "}
                <span
                  className={
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {product.stock}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  toggleStock(product.id, product.stock)
                }
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Toggle Stock
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
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
