"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const itemsRef = collection(db, "cart", u.uid, "items");

        unsubscribe = onSnapshot(itemsRef, (snapshot) => {
          const data: any[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          setItems(data);
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const increase = async (item: any) => {
    await updateDoc(doc(db, "cart", user.uid, "items", item.id), {
      quantity: increment(1),
    });
  };

  const decrease = async (item: any) => {
    if (item.quantity <= 1) return;
    await updateDoc(doc(db, "cart", user.uid, "items", item.id), {
      quantity: increment(-1),
    });
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "cart", user.uid, "items", id));
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="p-6 pt-[100px]">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      {items.map((item) => (
        <div key={item.id} className="mb-4">
          <p>{item.name}</p>
          <div className="flex gap-3">
            <button onClick={() => decrease(item)}>-</button>
            {item.quantity}
            <button onClick={() => increase(item)}>+</button>
            <button onClick={() => remove(item.id)}>Remove</button>
          </div>
        </div>
      ))}

      <h2>Total: ₹{total}</h2>

      <button
        onClick={() => router.push("/checkout")}
        className="bg-black text-white px-6 py-3 rounded mt-4"
      >
        Checkout
      </button>
    </div>
  );
}
