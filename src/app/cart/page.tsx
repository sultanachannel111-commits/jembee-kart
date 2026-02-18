"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUserId(user.uid);

      const snap = await getDoc(doc(db, "cart", user.uid));

      if (snap.exists()) {
        setItems(snap.data().products || []);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateQuantity = async (index: number, change: number) => {
    const updated = [...items];
    updated[index].quantity += change;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }

    setItems(updated);

    await updateDoc(doc(db, "cart", userId!), {
      products: updated,
    });
  };

  const checkout = async () => {
    if (!userId || items.length === 0) return;

    for (let item of items) {
      await addDoc(collection(db, "orders"), {
        userId,
        productName: item.name,
        price: item.price * item.quantity,
        status: "Pending",
        trackingId: "",
        createdAt: new Date(),
      });
    }

    await deleteDoc(doc(db, "cart", userId));
    setItems([]);
    setMessage("Order placed successfully 💖");
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">

      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        My Cart 🛒
      </h1>

      {message && (
        <div className="mb-4 text-green-600 font-semibold">
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          Cart is empty.
        </div>
      ) : (
        <div className="space-y-6">

          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">
                  {item.name}
                </h2>
                <p className="text-pink-600 font-bold">
                  ₹{item.price}
                </p>
                <p>Qty: {item.quantity}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateQuantity(index, 1)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  +
                </button>

                <button
                  onClick={() => updateQuantity(index, -1)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold">
              Total: ₹{total}
            </h2>

            <button
              onClick={checkout}
              className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full hover:opacity-90"
            >
              Checkout 💕
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
