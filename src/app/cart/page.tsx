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

  /* 🔄 LOAD CART */
  useEffect(() => {

    let unsubscribe:any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {

      if (u) {

        setUser(u);

        const itemsRef = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(itemsRef, (snapshot) => {

          const data:any[] = [];

          snapshot.forEach((docSnap) => {

            const d:any = docSnap.data();

            data.push({
              id: d.productId || docSnap.id,   // 🔥 productId (offer match)
              cartId: docSnap.id,              // 🔥 cart doc id
              name: d.name,
              image: d.image || "",
              price: d.price || 0,
              quantity: d.quantity || 1,
              variations: d.variations || []
            });

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

  /* 💰 PRICE */
  const getPrice = (item:any) => {

    const sellPrice =
      item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
      item.price ||
      0;

    return sellPrice;
  };

  /* ➕ INCREASE */
  const increase = async (item:any) => {
    await updateDoc(
      doc(db, "carts", user.uid, "items", item.cartId),
      {
        quantity: increment(1)
      }
    );
  };

  /* ➖ DECREASE */
  const decrease = async (item:any) => {

    if (item.quantity <= 1) return;

    await updateDoc(
      doc(db, "carts", user.uid, "items", item.cartId),
      {
        quantity: increment(-1)
      }
    );
  };

  /* ❌ REMOVE */
  const remove = async (cartId:string) => {

    if (!confirm("Remove item?")) return;

    await deleteDoc(
      doc(db, "carts", user.uid, "items", cartId)
    );
  };

  /* 💵 TOTAL */
  const total = items.reduce(
    (sum, i) => sum + getPrice(i) * i.quantity,
    0
  );

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4 pt-[110px] pb-28">

        <h1 className="text-3xl font-bold text-center mb-6">
          🛒 Your Cart
        </h1>

        {items.length === 0 && (
          <div className="text-center text-gray-500">
            Cart is empty 😢
          </div>
        )}

        {/* ITEMS */}
        <div className="space-y-4">

          {items.map((item) => (

            <div
              key={item.cartId}
              className="flex gap-4 p-4 rounded-3xl backdrop-blur-xl bg-white/60 border border-white/30 shadow-xl"
            >

              <img
                src={item.image || "/no.png"}
                className="w-24 h-24 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <p className="font-semibold text-lg">
                  {item.name}
                </p>

                <p className="text-green-600 font-bold text-xl mt-1">
                  ₹{getPrice(item)}
                </p>

                {/* QTY */}
                <div className="flex items-center gap-3 mt-3">

                  <button
                    onClick={() => decrease(item)}
                    className="w-8 h-8 bg-gray-200 rounded-full"
                  >
                    -
                  </button>

                  <span className="font-bold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increase(item)}
                    className="w-8 h-8 bg-gray-200 rounded-full"
                  >
                    +
                  </button>

                  <button
                    onClick={() => remove(item.cartId)}
                    className="ml-4 text-red-500 text-sm"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* SUMMARY */}
        <div className="mt-6 backdrop-blur-xl bg-white/60 p-4 rounded-3xl shadow-xl">

          <div className="flex justify-between text-lg">
            <span>Items Total</span>
            <span>₹{total}</span>
          </div>

        </div>

        {/* BUTTON */}
        <div className="fixed bottom-0 left-0 w-full p-3">

          <button
            onClick={() => {

              if (items.length === 0) {
                alert("Cart empty ❌");
                return;
              }

              router.push("/checkout");

            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl font-bold shadow-lg"
          >
            Checkout 🚀
          </button>

        </div>

        {/* 🐞 DEBUG (optional) */}
        <div className="mt-6 bg-black text-green-400 text-xs p-3 rounded-xl overflow-auto">
          <pre>
{JSON.stringify(items, null, 2)}
          </pre>
        </div>

      </div>
    </>
  );
}
