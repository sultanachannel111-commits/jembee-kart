"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Dummy cart data (baad me cart se aayega)
  const cartItems = [
    { name: "Product 1", price: 500, quantity: 1 },
  ];

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const placeOrder = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cartItems,
        totalAmount: totalAmount,

        // IMPORTANT FIELDS 👇
        status: "Placed",
        returnRequested: false,
        returnReason: "",

        createdAt: new Date(),
      });

      alert("Order Placed Successfully 🎉");

      router.push("/profile");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 pt-[96px] bg-gradient-to-b from-pink-100 to-white">

      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <span>{item.name}</span>
            <span>₹{item.price}</span>
          </div>
        ))}

        <hr className="my-2" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

    </div>
  );
}
