"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const router = useRouter();

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const itemsRef = collection(
        db,
        "cart",
        currentUser.uid,
        "items"
      );

      const snap = await getDocs(itemsRef);

      const items: any[] = [];

      snap.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      setCartItems(items);
    });

    return () => unsubscribe();
  }, []);

  /* ================= TOTAL ================= */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= PLACE ORDER ================= */
  /* ================= PLACE ORDER ================= */
const placeOrder = async () => {
  if (!user || cartItems.length === 0) return;

  setLoading(true);

  try {
    const batch = writeBatch(db);

    /* ===== STOCK VALIDATION ===== */
    for (const item of cartItems) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        alert(`${item.name} not found ❌`);
        setLoading(false);
        return;
      }

      const productData = productSnap.data();

      if (productData.stock < item.quantity) {
        alert(`Only ${productData.stock} left for ${item.name}`);
        setLoading(false);
        return;
      }
    }

    /* ===== CREATE ORDER ===== */
    const orderRef = doc(collection(db, "orders"));

    batch.set(orderRef, {
      userId: user.uid,
      products: cartItems,
      totalAmount: totalAmount,
      status: "Placed",
      paymentMethod: paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "Pending" : "Paid",
      returnRequested: false,
      returnReason: "",
      createdAt: serverTimestamp(),
    });

    /* ===== REDUCE STOCK SAFELY ===== */
    for (const item of cartItems) {
      const productRef = doc(db, "products", item.productId);

      batch.update(productRef, {
        stock: increment(-item.quantity),
      });
    }

    /* ===== CLEAR CART ===== */
    const itemsRef = collection(db, "cart", user.uid, "items");
    const snap = await getDocs(itemsRef);

    snap.forEach((document) => {
      batch.delete(document.ref);
    });

    /* ===== COMMIT EVERYTHING TOGETHER ===== */
    await batch.commit();

    setCartItems([]);

    alert("Order Placed Successfully 🎉");

    router.push(`/order-success/${orderRef.id}`);

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
          {/* ===== CART SUMMARY ===== */}
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

          {/* ===== PAYMENT METHOD ===== */}
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <h2 className="font-semibold mb-3">
              Select Payment Method
            </h2>

            <div
              onClick={() => setPaymentMethod("COD")}
              className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                paymentMethod === "COD"
                  ? "border-pink-600 bg-pink-50"
                  : "border-gray-300"
              }`}
            >
              💵 Cash on Delivery
            </div>

            <div
              onClick={() => setPaymentMethod("ONLINE")}
              className={`p-3 border rounded-lg cursor-pointer ${
                paymentMethod === "ONLINE"
                  ? "border-pink-600 bg-pink-50"
                  : "border-gray-300"
              }`}
            >
              💳 Online Payment
            </div>
          </div>

          {/* ===== PLACE ORDER BUTTON ===== */}
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
