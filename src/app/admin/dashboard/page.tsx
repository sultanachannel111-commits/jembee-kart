"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Running Shoes",
      price: 1999,
      sales: 5,
    },
  ]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addProduct = () => {
    if (!name || !price) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
        price: Number(price),
        sales: 0,
      },
    ]);

    setName("");
    setPrice("");
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const totalSales = products.reduce(
    (sum, p) => sum + p.sales,
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">
          Add Product
        </h2>

        <input
          placeholder="Product Name"
          className="border p-2 mr-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          className="border p-2 mr-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={addProduct}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <h2 className="font-semibold mb-4">
        Total WhatsApp Sales: {totalSales}
      </h2>

      <div className="bg-white rounded-xl shadow p-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between border-b py-2"
          >
            <div>
              {p.name} - ₹{p.price} | Sold: {p.sales}
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
