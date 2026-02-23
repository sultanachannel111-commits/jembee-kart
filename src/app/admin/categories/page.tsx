"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminCategoriesPage() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async () => {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name || !image) return alert("All fields required");

    await addDoc(collection(db, "categories"), {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image,
      order: Number(order),
      active: true,
      createdAt: new Date(),
    });

    setName("");
    setImage("");
    setOrder(1);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "categories", id), {
      active: !current,
    });
    fetchCategories();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Add Form */}
      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          className="border px-4 py-2 rounded"
        />
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Category Image URL"
          className="border px-4 py-2 rounded"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          placeholder="Order"
          className="border px-4 py-2 rounded"
        />
        <button
          onClick={addCategory}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Category List */}
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-3 rounded shadow">
            <img
              src={cat.image}
              className="h-32 w-full object-cover rounded"
            />
            <p className="mt-2 font-semibold">{cat.name}</p>
            <p className="text-sm text-gray-500">Order: {cat.order}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => toggleActive(cat.id, cat.active)}
                className={`px-3 py-1 rounded text-sm ${
                  cat.active
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {cat.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteCategory(cat.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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
