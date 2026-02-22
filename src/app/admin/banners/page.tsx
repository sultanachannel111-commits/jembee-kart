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
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch banners sorted by order
  const fetchBanners = async () => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setBanners(data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ➕ Add Banner
  const addBanner = async () => {
    if (!image) return alert("Please enter image URL");

    try {
      setLoading(true);

      await addDoc(collection(db, "banners"), {
        image,
        order: Number(order),
        active: true,
        createdAt: serverTimestamp(),
      });

      setImage("");
      setOrder(1);
      fetchBanners();
    } catch (error) {
      console.error("Error adding banner:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Toggle Active
  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "banners", id), {
      active: !current,
    });
    fetchBanners();
  };

  // ❌ Delete Banner
  const deleteBanner = async (id: string) => {
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-pink-600">
        Banner Management
      </h1>

      {/* Add Banner Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <input
          type="text"
          placeholder="Paste Banner Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="border p-3 w-full rounded mb-4"
        />

        <input
          type="number"
          placeholder="Banner Order (1,2,3...)"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="border p-3 w-full rounded mb-4"
        />

        <button
          onClick={addBanner}
          disabled={loading}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Adding..." : "Add Banner"}
        </button>
      </div>

      {/* Banner List */}
      <div className="grid md:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded-xl shadow"
          >
