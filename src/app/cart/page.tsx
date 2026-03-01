"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
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
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const router = useRouter();

  /* 🔥 FETCH CART ITEMS */
  const fetchCart = async (uid: string) => {
    const itemsRef = collection(db, "cart", uid, "items");
    const snap = await getDocs(itemsRef);

    const cartItems = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setItems(cartItems);
    setLoading(false);
  };

  /* 🔥 AUTH LISTENER */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      await fetchCart(user.uid);
    });

    return () => unsubscribe();
  }, []);

  /* 🔥 UPDATE QUANTITY */
  const updateQuantity = async (itemId: string, change: number) => {
    if (!userId) return;

    const itemRef = doc(db, "cart", userId, "items", itemId);
    const snap = await getDoc(itemRef);

    if (!snap.exists()) return;

    const newQty = snap.data().quantity + change;

    if (newQty <= 0) {
      await deleteDoc(itemRef);
    } else {
      await updateDoc(itemRef, { quantity: newQty });
    }

    await fetchCart(userId);
  };

  /* 🔥 CHECKOUT */
  const checkout = async () => {
    if (!userId || items.length === 0) return;

    setProcessing(true);

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

      // 🔥 CLEAR CART ITEMS
      const itemsRef = collection(db, "cart", userId, "items");
      const snap = await getDocs(itemsRef);

      for (const docItem of snap.docs) {
        await deleteDoc(docItem.ref);
      }

      setItems([]);

      router.push(`/payment/${docRef.id}`);
    } catch (error) {
      console.log("Checkout error:", error);
    }

    setProcessing(false);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading cart...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-pink-600 mb-8">
          My Cart 🛒
        </h1>

        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            Your cart is empty 💕
          </div>
        ) : (
          <div className="space-y-6">

            {items.map((item) => (
              <div
                key={item.id}
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
                    onClick={() => updateQuantity(item.id, 1)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                  >
                    +
                  </button>

                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white p-8 rounded-2xl shadow">
              <h2 className="text-2xl font-bold text-purple-700">
                Total: ₹{total}
              </h2>

              <button
                onClick={checkout}
                disabled={processing}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full hover:opacity-90 disabled:opacity-50 transition"
              >
                {processing ? "Processing..." : "Proceed to Payment 💳"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
