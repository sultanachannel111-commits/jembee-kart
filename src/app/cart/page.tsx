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
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* 🔥 AUTH + FETCH CART */
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

  /* 🔥 UPDATE QUANTITY */
  const updateQuantity = async (index: number, change: number) => {
    if (!userId) return;

    const updated = [...items];
    updated[index].quantity += change;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }

    setItems(updated);

    await updateDoc(doc(db, "cart", userId), {
      products: updated,
    });
  };

  /* 🔥 CHECKOUT WITH PAYMENT PAGE REDIRECT */
  const checkout = async () => {
    if (!userId || items.length === 0) return;

    setLoading(true);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const orderId = "ORD" + Date.now().toString().slice(-8);

      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 15);

      const docRef = await addDoc(collection(db, "orders"), {
        userId,
        orderId,
        amount: totalAmount,
        paymentStatus: "INITIATED",
        paymentMethod: "UPI",
        products: items,
        createdAt: new Date(),
        expiresAt: expires,
      });

      // 🔥 CLEAR CART
      await deleteDoc(doc(db, "cart", userId));
      setItems([]);

      // 🔥 REDIRECT TO PAYMENT PAGE
      router.push(`/payment/${docRef.id}`);

    } catch (error) {
      setMessage("Something went wrong ❌");
    }

    setLoading(false);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-pink-600 mb-8">
          My Cart 🛒
        </h1>

        {message && (
          <div className="mb-6 text-purple-600 font-semibold">
            {message}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            Your cart is empty 💕
          </div>
        ) : (
          <div className="space-y-6">

            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {item.name}
                  </h2>
                  <p className="text-pink-600 font-bold">
                    ₹{item.price}
                  </p>
                  <p className="text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                  >
                    +
                  </button>

                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}

            {/* 🔥 TOTAL + PAYMENT */}
            <div className="bg-white p-8 rounded-2xl shadow">

              <h2 className="text-2xl font-bold text-purple-700">
                Total: ₹{total}
              </h2>

              <button
                onClick={checkout}
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? "Processing..." : "Proceed to Payment 💳"}
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
