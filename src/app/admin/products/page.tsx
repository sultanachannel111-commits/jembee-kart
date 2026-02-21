"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
}

export default function AdminProductsPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const list: Product[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    setProducts(list);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    if (!name || !price) {
      alert("Name aur Price required hai");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "products"), {
        name,
        sellingPrice: Number(price),
        createdAt: serverTimestamp(),
      });

      setName("");
      setPrice("");
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete karna hai?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <div className="animate-fadeIn">

      <h1 className="text-3xl font-bold mb-6 text-brand-pink">
        Manage Products
      </h1>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Selling Price"
            className="border p-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-brand-pink text-white rounded px-4 py-2 hover:opacity-90 transition"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">{product.name}</td>
                <td className="p-3">₹ {product.sellingPrice}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
