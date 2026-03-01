"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* 🔥 AUTH + FETCH CART (SUBCOLLECTION) */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      const itemsRef = collection(db, "cart", user.uid, "items");
      const snap = await getDocs(itemsRef);

      const cartItems = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(cartItems);
    });

    return () => unsubscribe();
  }, []);

  /* 🔥 UPDATE QUANTITY */
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!userId) return;

    const itemRef = doc(db, "cart", userId, "items", itemId);

    if (quantity <= 0) {
      await deleteDoc(itemRef);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }

    await updateDoc(itemRef, { quantity });

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  /* 🔥 CHECKOUT */
  const checkout = async () => {
    if (!userId || items.length === 0) return;

    setLoading(true);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId,
        products: items,
        amount: totalAmount,
        paymentStatus: "INITIATED",
        status: "Placed",
        createdAt: new Date(),
      });

      // 🔥 CLEAR CART (Delete all items)
      const itemsRef = collection(db, "cart", userId, "items");
      const snap = await getDocs(itemsRef);

      snap.forEach(async (docItem) => {
        await deleteDoc(docItem.ref);
      });

      setItems([]);

      router.push(`/payment/${orderRef.id}`);
    } catch (error) {
      console.log(error);
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

        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            Your cart is empty 💕
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow flex justify-between items-center"
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
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="bg-green-500 text-white px-4 py-2 rounded-full"
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
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
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full"
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
