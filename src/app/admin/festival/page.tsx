"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminFestivalPage() {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch existing data
  useEffect(() => {
    const fetchFestival = async () => {
      const snap = await getDoc(doc(db, "settings", "festival"));
      if (snap.exists()) {
        const data = snap.data();
        setImage(data.image || "");
        setTitle(data.title || "");
        setActive(data.active || false);
      }
      setLoading(false);
    };

    fetchFestival();
  }, []);

  const saveFestival = async () => {
    await setDoc(doc(db, "settings", "festival"), {
      image,
      title,
      active,
      updatedAt: new Date(),
    });

    alert("Festival Updated Successfully 🎉");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">
        Festival Banner Management
      </h1>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Festival Title (Optional)"
        className="border px-4 py-2 rounded w-full mb-4"
      />

      {/* Image URL */}
      <input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Festival Banner Image URL"
        className="border px-4 py-2 rounded w-full mb-4"
      />

      {/* Preview */}
      {image && (
        <img
          src={image}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}

      {/* Active Toggle */}
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Show Festival Banner on Homepage
      </label>

      <button
        onClick={saveFestival}
        className="bg-pink-600 text-white px-6 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
