"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      const itemsRef = collection(db, "cart", user.uid, "items");

      const unsubscribeCart = onSnapshot(itemsRef, (snapshot) => {
        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(cartItems);
      });

      return () => unsubscribeCart();
    });

    return () => unsubscribeAuth();
  }, []);

  const updateQuantity = async (id: string, quantity: number) => {
    if (!userId) return;

    if (quantity <= 0) {
      await deleteDoc(doc(db, "cart", userId, "items", id));
    } else {
      await updateDoc(doc(db, "cart", userId, "items", id), {
        quantity,
      });
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">My Cart 🛒</h1>

      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow mb-4"
            >
              <h2 className="font-semibold">{item.name}</h2>
              <p>₹{item.price}</p>
              <p>Qty: {item.quantity}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 font-bold text-lg">
            Total: ₹{total}
          </div>
        </>
      )}
    </div>
  );
}
