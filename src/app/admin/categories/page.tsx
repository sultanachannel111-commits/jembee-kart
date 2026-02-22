"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminCategoriesPage() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
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
      image,
      createdAt: new Date(),
    });

    setName("");
    setImage("");
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
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
        <button
          onClick={addCategory}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-3 rounded shadow">
            <img src={cat.image} className="h-32 w-full object-cover rounded" />
            <p className="mt-2 font-semibold">{cat.name}</p>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
