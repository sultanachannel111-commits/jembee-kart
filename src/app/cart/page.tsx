"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import Header from "@/components/home/Header";

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

    let unsubscribe:any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {

      if (u) {

        setUser(u);

        // ✅ FIX HERE
        const itemsRef = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(itemsRef, (snapshot) => {

          const data:any[] = [];

          snapshot.forEach((doc) => {
            data.push({
              id: doc.id,
              ...doc.data()
            });
          });

          console.log("CART DATA:", data); // 🔥 DEBUG

          setItems(data);

        });

      }

    });

    return () => {
      unsubAuth();
      if (unsubscribe) unsubscribe();
    };

  }, []);

  /* INCREASE */

  const increase = async (item:any) => {

    await updateDoc(
      doc(db, "carts", user.uid, "items", item.id),
      {
        quantity: increment(1)
      }
    );

  };

  /* DECREASE */

  const decrease = async (item:any) => {

    if (item.quantity <= 1) return;

    await updateDoc(
      doc(db, "carts", user.uid, "items", item.id),
      {
        quantity: increment(-1)
      }
    );

  };

  /* REMOVE */

  const remove = async (id:string) => {

    await deleteDoc(
      doc(db, "carts", user.uid, "items", id)
    );

  };

  /* TOTAL */

  const total = items.reduce(
    (sum, i) =>
      sum +
      (i.price || 0) *
      (i.quantity || 1),
    0
  );

  return (

    <>
    
    <Header />

    <div className="p-6 pt-[110px]">

      <h1 className="text-2xl font-bold mb-6">
        🛒 Cart
      </h1>

      {items.length === 0 && (
        <p>Your cart is empty</p>
      )}

      {items.map((item) => (

        <div
          key={item.id}
          className="mb-4 border p-4 rounded flex gap-4 items-center"
        >

          <img
            src={item.image}
            className="w-20 h-20 object-cover rounded"
          />

          <div className="flex-1">

            <p className="font-medium">
              {item.name}
            </p>

            <p className="font-bold text-lg">
              ₹{item.price}
            </p>

            <div className="flex gap-3 mt-2 items-center">

              <button
                onClick={() => decrease(item)}
                className="px-2 bg-gray-200 rounded"
              >
                -
              </button>

              {item.quantity}

              <button
                onClick={() => increase(item)}
                className="px-2 bg-gray-200 rounded"
              >
                +
              </button>

              <button
                onClick={() => remove(item.id)}
                className="text-red-500 ml-4"
              >
                Remove
              </button>

            </div>

          </div>

        </div>

      ))}

      <div className="mt-6 text-xl font-bold">
        Total : ₹{total}
      </div>

      <button
        onClick={() => {

          if (items.length === 0) {
            alert("Cart is empty");
            return;
          }

          const item = items[0];

          router.push(
            `/checkout?productId=${item.productId || item.id}`
          );

        }}
        className="bg-black text-white px-6 py-3 rounded mt-6"
      >
        Checkout
      </button>

    </div>

    </>

  );

}
