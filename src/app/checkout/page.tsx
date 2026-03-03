"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  collection,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e: any) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (
      !address.name ||
      !address.phone ||
      !address.addressLine ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill all address fields");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      const orderRef = doc(collection(db, "orders"));

      await setDoc(orderRef, {
        orderId: orderRef.id,
        userId: user.uid,
        items: cartItems,
        total,
        address,
        paymentStatus: "PENDING",
        status: "pending_admin_confirm",
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry
        ),
      });

      router.push(`/payment/${orderRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Your cart is empty 🛒
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-6 pt-[100px]">

      <div className="max-w-2xl mx-auto space-y-8">

        {/* ORDER SUMMARY */}
        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-2"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg pt-4">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* ADDRESS FORM */}
        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Shipping Address</h2>

          <input
            name="name"
            placeholder="Full Name"
            value={address.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={address.phone}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />

          <input
            name="addressLine"
            placeholder="Address Line"
            value={address.addressLine}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />

          <input
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />

          <input
            name="pincode"
            placeholder="Pincode"
            value={address.pincode}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-xl"
          />
        </div>

        {/* PLACE ORDER BUTTON */}
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold shadow-lg"
        >
          {loading ? "Processing..." : `Pay ₹${total} with UPI`}
        </button>

      </div>
    </div>
  );
}
