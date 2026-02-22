"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminFestivalPage() {
  const [image, setImage] = useState("");
  const [active, setActive] = useState(false);

  const saveFestival = async () => {
    await setDoc(doc(db, "settings", "festival"), {
      image,
      active,
    });

    alert("Festival Updated");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Festival Banner</h1>

      <input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Festival Banner Image URL"
        className="border px-4 py-2 rounded w-full mb-4"
      />

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Show Festival Banner
      </label>

      <button
        onClick={saveFestival}
        className="bg-pink-600 text-white px-6 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
