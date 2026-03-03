"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      const snap = await getDocs(
        collection(db, "cart", u.uid, "items")
      );

      const data: any[] = [];
      snap.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setItems(data);
    });

    return () => unsub();
  }, []);

  const removeItem = async (id: string) => {
    if (!user) return;

    await deleteDoc(doc(db, "cart", user.uid, "items", id));
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen p-6 pt-[100px]">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty 🛒</p>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between mb-4"
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <div>
                ₹{item.price}
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-3 text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <hr className="my-4" />

          <div className="font-bold text-lg mb-4">
            Total: ₹{total}
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
