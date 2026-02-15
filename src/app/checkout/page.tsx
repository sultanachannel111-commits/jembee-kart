"use client";

import { useCart } from "@/providers/cart-provider";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!name || !address) return;

    if (!db || !user) return;

    setLoading(true);

    const orderData = {
      userId: user.uid,
      customerName: name,
      shippingAddress: address,
      items: cart,
      totalAmount: total,
      status: "Confirmed",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    clearCart();

    router.push(`/order-success?id=${docRef.id}`);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6 max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Order Summary</h2>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr className="my-2" />
              <p className="font-bold">Total: ₹{total}</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <textarea
                placeholder="Full Address"
                className="w-full border p-2 rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
