"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sales: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  // 🔐 Protect page
  useEffect(() => {
    const auth = sessionStorage.getItem("isAdmin");
    if (!auth) {
      router.push("/admin");
    }

    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  // 💾 Save products to localStorage
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // ➕ Add Product
  const addProduct = () => {
    if (!name || !price || !image) return;

    const newProduct: Product = {
      id: Date.now(),
      name,
      price: Number(price),
      image,
      sales: 0,
    };

    setProducts([...products, newProduct]);
    setName("");
    setPrice("");
    setImage("");
  };

  // ❌ Delete Product
  const deleteProduct = (id: number) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
  };

  // 📈 Increase WhatsApp Sales
  const increaseSales = (id: number) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, sales: p.sales + 1 } : p
    );
    setProducts(updated);
  };

  // 💰 Total Sales Count
  const totalSales = products.reduce((acc, p) => acc + p.sales, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        JEMBEE KART Admin Panel
      </h1>

      {/* TOTAL WHATSAPP SALES */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold">
          Total WhatsApp Sales: {totalSales}
        </h2>
      </div>

      {/* ADD PRODUCT */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>

        <input
          type="text"
          placeholder="Product Name"
          className="border p-2 rounded w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          className="border p-2 rounded w-full mb-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Image URL"
          className="border p-2 rounded w-full mb-3"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button
          onClick={addProduct}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            <img
              src={product.image}
              className="h-40 w-full object-cover rounded mb-3"
            />

            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-blue-600 font-bold">
              ₹{product.price}
            </p>

            <p className="text-sm mt-2">
              WhatsApp Sold: {product.sales}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => increaseSales(product.id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                + Sale
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
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
