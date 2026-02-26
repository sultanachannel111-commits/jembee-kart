"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AdminCategories() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "qikinkCategories"),
      (snap) => {
        setCategories(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      }
    );
    return () => unsub();
  }, []);

  const saveCategory = async () => {
    if (!name || !image) return;

    if (editId) {
      await updateDoc(doc(db, "qikinkCategories", editId), {
        name,
        image,
      });
      setEditId(null);
    } else {
      await addDoc(collection(db, "qikinkCategories"), {
        name,
        image,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    }

    setName("");
    setImage("");
  };

  const editCategory = (cat: any) => {
    setName(cat.name);
    setImage(cat.image);
    setEditId(cat.id);
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "qikinkCategories", id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin Qikink Categories
      </h1>

      <div className="space-y-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          className="border px-3 py-2 rounded w-full"
        />

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="border px-3 py-2 rounded w-full"
        />

        <button
          onClick={saveCategory}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="border p-3 rounded">

            <img
              src={c.image}
              alt={c.name}
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />

            <p className="text-center mt-2 font-semibold">
              {c.name}
            </p>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => editCategory(c)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => deleteCategory(c.id)}
                className="text-red-600"
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
