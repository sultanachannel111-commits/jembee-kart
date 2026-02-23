"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOffersPage() {
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState<number | "">("");
  const [endDate, setEndDate] = useState("");
  const [offers, setOffers] = useState<any[]>([]);
  const [error, setError] = useState("");

  // 🔥 Force re-render every second for live countdown
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔥 Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOffers(data);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Add Offer
  const addOffer = async () => {
    setError("");

    if (!title.trim()) {
      setError("Enter offer title");
      return;
    }

    if (!discount || Number(discount) <= 0) {
      setError("Enter valid discount %");
      return;
    }

    if (!endDate) {
      setError("Select end date & time");
      return;
    }

    await addDoc(collection(db, "offers"), {
      title: title.trim(),
      discount: Number(discount),
      endDate,
      active: true,
      createdAt: new Date(),
    });

    setTitle("");
    setDiscount("");
    setEndDate("");
  };

  // ✅ Delete Offer
  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, "offers", id));
  };

  // ✅ Toggle Active
  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc
