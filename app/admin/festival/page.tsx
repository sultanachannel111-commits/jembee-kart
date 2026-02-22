"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FestivalBannerAdmin() {
  const [image, setImage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "settings", "festival"));
      if (snap.exists()) {
        const data = snap.data();
        setImage(data.image);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setIsActive(data.isActive);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, "settings", "festival"), {
      image,
      startDate,
      endDate,
      isActive,
    });

    alert("Festival Banner Updated");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Festival Banner</h2>

      <input
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <label className="text-sm">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <label className="text-sm">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
        />
        <span>Active</span>
      </div>

      <button
        onClick={handleSave}
        className="bg-purple-600 text-white px-4 py-2 w-full"
      >
        Save
      </button>
    </div>
  );
}
