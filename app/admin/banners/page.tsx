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

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [image, setImage] = useState("");

  const fetchBanners = async () => {
    const snapshot = await getDocs(collection(db, "banners"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBanners(data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = async () => {
    if (!image) return alert("Enter image URL");

    await addDoc(collection(db, "banners"), {
      image,
      isActive: true,
      sortOrder: banners.length + 1,
    });

    setImage("");
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "banners", id), {
      isActive: !current,
    });
    fetchBanners();
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Banners</h2>

      <input
        placeholder="Banner Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleAdd}
        className="bg-purple-600 text-white px-4 py-2 w-full mb-4"
      >
        Add Banner
      </button>

      {banners.map((ban) => (
        <div
          key={ban.id}
          className="flex items-center justify-between border p-2 mb-2"
        >
          <img
            src={ban.image}
            className="w-20 h-12 object-cover rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={() => toggleActive(ban.id, ban.isActive)}
              className="text-blue-500 text-sm"
            >
              {ban.isActive ? "Disable" : "Enable"}
            </button>

            <button
              onClick={() => handleDelete(ban.id)}
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
