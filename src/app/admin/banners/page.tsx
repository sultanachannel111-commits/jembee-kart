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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBanners() {
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(1);
  const [banners, setBanners] = useState<any[]>([]);

  const fetchBanners = async () => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const snap = await getDocs(q);

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBanners(data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async () => {
    if (!image) return alert("Enter image URL");

    await addDoc(collection(db, "banners"), {
      image,
      order: Number(order),
      active: true,
      createdAt: serverTimestamp(),
    });

    setImage("");
    setOrder(1);
    fetchBanners();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await updateDoc(doc(db, "banners", id), {
      active: !active,
    });
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">
        Banner Management
      </h1>

      {/* Add Banner */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <input
          type="text"
          placeholder="Banner Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="border p-3 w-full rounded mb-4"
        />

        <input
          type="number"
          placeholder="Order (1,2,3...)"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="border p-3 w-full rounded mb-4"
        />

        <button
          onClick={addBanner}
          className="bg-pink-600 text-white px-6 py-2 rounded"
        >
          Add Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="grid md:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            <img
              src={banner.image}
              alt="banner"
              className="w-full h-40 object-cover rounded mb-4"
            />

            <div className="flex justify-between mb-3">
              <button
                onClick={() =>
                  toggleActive(banner.id, banner.active)
                }
                className={`px-3 py-1 rounded text-white ${
                  banner.active
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              >
                {banner.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteBanner(banner.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Order: {banner.order}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
