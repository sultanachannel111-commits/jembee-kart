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
} from "firebase/firestore";

export default function AdminCategories() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "qikinkCategories"),
      (snap) => {
        setCategories(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
    return () => unsub();
  }, []);

  const addCategory = async () => {
    if (!name) return;

    await addDoc(collection(db, "qikinkCategories"), {
      name,
      categoryId: Date.now(),
      isActive: true,
      createdAt: serverTimestamp(),
    });

    setName("");
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "qikinkCategories", id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Admin Qikink Categories
      </h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category Name"
        className="border px-3 py-2 rounded"
      />

      <button
        onClick={addCategory}
        className="ml-2 bg-black text-white px-4 py-2 rounded"
      >
        Add
      </button>

      <div className="mt-6">
        {categories.map((c) => (
          <div key={c.id} className="flex justify-between mb-2">
            <span>{c.name}</span>
            <button
              onClick={() => deleteCategory(c.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
