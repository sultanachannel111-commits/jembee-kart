"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* 🔥 AUTH + FETCH CART */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const snap = await getDoc(doc(db, "cart", currentUser.uid));

      if (snap.exists()) {
        setCartItems(snap.data().products || []);
      }
    });

    return () => unsubscribe();
  }, []);

  /* 🔥 CALCULATE TOTAL */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* 🔥 PLACE ORDER */
  const placeOrder = async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);

    try {
      // ✅ STOCK VALIDATION
      for (const item of cartItems) {
        const productSnap = await getDoc(
          doc(db, "products", item.id)
        );

        if (!productSnap.exists()) {
          alert(`${item.name} not found ❌`);
          setLoading(false);
          return;
        }

        const productData = productSnap.data();

        if (productData.stock < item.quantity) {
          alert(
            `Only ${productData.stock} left for ${item.name}`
          );
          setLoading(false);
          return;
        }
      }

      // ✅ CREATE ORDER
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        products: cartItems,
        totalAmount: totalAmount,

        status: "Placed",
        paymentStatus: "Pending",
        paymentMethod: "COD",

        returnRequested: false,
        returnReason: "",

        createdAt: new Date(),
      });

      // ✅ REDUCE STOCK
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const snap = await getDoc(productRef);

        if (snap.exists()) {
          const data = snap.data();
          await updateDoc(productRef, {
            stock: data.stock - item.quantity,
          });
        }
      }

      // ✅ CLEAR CART
      await deleteDoc(doc(db, "cart", user.uid));
      setCartItems([]);

      alert("Order Placed Successfully 🎉");

      router.push("/profile");

    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 pt-[96px] bg-gradient-to-b from-pink-100 to-white">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          Your cart is empty 🛒
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between mb-2"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>
                  ₹{item.price * item.quantity}
                </span>
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
        </>
      )}
    </div>
  );
}
