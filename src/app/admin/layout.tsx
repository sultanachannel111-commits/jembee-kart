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
      <h1 className="text-2xl font-bold mb-6
