"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBanners() {
  const [image, setImage] = useState("");
  const [banners, setBanners] = useState<any[]>([]);

  const fetchBanners = async () => {
    const snap = await getDocs(collection(db, "banners"));
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async () => {
    if (!image) return;

    await addDoc(collection(db, "banners"), {
      image,
      active: true,
      createdAt: new Date(),
    });

    setImage("");
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banner Control</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Paste Banner Image URL"
          value={image}
          onChange={e => setImage(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />
        <button
          onClick={addBanner}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add Banner
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white p-4 rounded shadow">
            <img src={b.image} className="w-full h-40 object-cover rounded" />
            <button
              onClick={() => deleteBanner(b.id)}
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
