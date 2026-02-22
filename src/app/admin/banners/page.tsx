"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBannersPage() {
  const [image, setImage] = useState("");
  const [banners, setBanners] = useState<any[]>([]);

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

  const addBanner = async () => {
    if (!image) return alert("Image URL required");

    await addDoc(collection(db, "banners"), {
      image,
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
      <h1 className="text-2xl font-bold mb-6">Manage Banners</h1>

      <div className="flex gap-3 mb-6">
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Enter Banner Image URL"
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={addBanner}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white p-3 rounded shadow">
            <img src={banner.image} className="h-40 w-full object-cover rounded" />
            <button
              onClick={() => deleteBanner(banner.id)}
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
