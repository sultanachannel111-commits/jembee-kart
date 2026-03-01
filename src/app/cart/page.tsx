"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      const itemsRef = collection(db, "cart", user.uid, "items");

      const unsubCart = onSnapshot(itemsRef, (snapshot) => {
        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(cartItems);
      });

      return () => unsubCart();
    });

    return () => unsubscribe();
  }, []);

  const updateQuantity = async (itemId: string, qty: number) => {
    if (!userId) return;

    const itemRef = doc(db, "cart", userId, "items", itemId);

    if (qty <= 0) {
      await deleteDoc(itemRef);
      return;
    }

    await updateDoc(itemRef, { quantity: qty });
  };

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
        totalAmount,
        status: "Placed",
        paymentStatus: "Pending",
        returnRequested: false,
        returnReason: "",
        createdAt: new Date(),
      });

      // Clear cart
      const itemsRef = collection(db, "cart", userId, "items");
      const snap = await getDocs(itemsRef);
      snap.forEach(async (docItem) => {
        await deleteDoc(docItem.ref);
      });

      router.push(`/order-success/${orderRef.id}`);
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
    <div className="min-h-screen p-6 pt-[96px]">
      <h1 className="text-3xl font-bold mb-6">My Cart 🛒</h1>

      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="p-4 shadow rounded-xl mb-4">
              <h2 className="font-semibold">{item.name}</h2>
              <p>₹{item.price}</p>

              <div className="flex gap-3 mt-2">
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

          <div className="text-xl font-bold mt-6">
            Total: ₹{total}
          </div>

          <button
            onClick={checkout}
            disabled={loading}
            className="mt-4 w-full bg-pink-600 text-white py-3 rounded-xl"
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
        </>
      )}
    </div>
  );
}
