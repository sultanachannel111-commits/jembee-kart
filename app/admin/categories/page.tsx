"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

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

  const handleAdd = async () => {
    if (!name || !image) return alert("Fill all fields");

    await addDoc(collection(db, "categories"), {
      name,
      image,
      isActive: true,
      sortOrder: categories.length + 1,
    });

    setName("");
    setImage("");
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "categories", id), {
      isActive: !current,
    });
    fetchCategories();
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

      <input
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleAdd}
        className="bg-purple-600 text-white px-4 py-2 w-full mb-4"
      >
        Add Category
      </button>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between border p-2 mb-2"
        >
          <div className="flex items-center gap-3">
            <img
              src={cat.image}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span>{cat.name}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleActive(cat.id, cat.isActive)}
              className="text-blue-500 text-sm"
            >
              {cat.isActive ? "Disable" : "Enable"}
            </button>

            <button
              onClick={() => handleDelete(cat.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
