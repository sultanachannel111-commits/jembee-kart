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

  // 🔥 Real-time fetch
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
      setError("Enter valid discount");
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

  // ✅ Delete
  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, "offers", id));
  };

  // ✅ Toggle Active
  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "offers", id), {
      active: !current,
    });
  };

  // ⏳ Countdown
  const getRemainingTime = (end: string) => {
    const total = new Date(end).getTime() - new Date().getTime();

    if (total <= 0) return "Expired";

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Discount & Offer Timer
      </h1>

      {/* Add Form */}
      <div className="grid md:grid-cols-4 gap-3 mb-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Offer Title"
          className="border px-4 py-2 rounded"
        />

        <input
          type="number"
          value={discount}
          onChange={(e) =>
            setDiscount(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
          placeholder="Discount %"
          className="border px-4 py-2 rounded"
        />

        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />

        <button
          onClick={addOffer}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* Offer List */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white p-4 rounded shadow"
          >
            <h3 className="font-semibold text-lg">
              {offer.title}
            </h3>

            <p className="text-pink-600 font-bold">
              {offer.discount}% OFF
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Ends In: {getRemainingTime(offer.endDate)}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  toggleActive(
                    offer.id,
                    offer.active
                  )
                }
                className={`px-3 py-1 rounded text-sm ${
                  offer.active
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {offer.active
                  ? "Active"
                  : "Inactive"}
              </button>

              <button
                onClick={() =>
                  deleteOffer(offer.id)
                }
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
