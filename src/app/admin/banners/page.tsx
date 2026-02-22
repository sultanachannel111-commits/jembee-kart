"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBanners() {
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(1);
  const [banners, setBanners] = useState<any[]>([]);

  const fetchBanners = async () => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async () => {
    if (!image) return alert("Image URL required");

    await addDoc(collection(db, "banners"), {
      image,
      active: true,
      order: Number(order),
      createdAt: new Date(),
    });

    setImage("");
    setOrder(1);
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "banners", id), {
      active: !current,
    });
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banner Control</h1>

      {/* Add Banner */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Paste Banner Image URL"
          value={image}
          onChange={e => setImage(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="number"
          placeholder="Order (1,2,3...)"
          value={order}
          onChange={e => setOrder(Number(e.target.value))}
          className="border p-2 w-full rounded mb-3"
        />

        <button
          onClick={addBanner}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="grid md:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white p-4 rounded shadow">
            <img
              src={b.image}
              className="w-full h-40 object-cover rounded mb-3"
            />

            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleActive(b.id, b.active)}
                className={`px-3 py-1 rounded text-white ${
                  b.active ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {b.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteBanner(b.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>

            <p className="text-sm mt-2">Order: {b.order}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
