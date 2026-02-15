"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/providers/cart-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("checkoutItems");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (!name || !address) {
      alert("Please fill all details");
      return;
    }

    // Clear cart
    clearCart();

    // Remove checkout items
    localStorage.removeItem("checkoutItems");

    alert("Order Placed Successfully 🎉");

    router.push("/orders");
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6 max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {items.length === 0 ? (
          <p>No items selected.</p>
        ) : (
          <>
            {/* Order Summary */}
            <div className="mb-6 border p-4 rounded">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between mb-3"
                >
                  <div>
                    <p className="font-medium">
                      {item.name} x {item.quantity}
                    </p>
                  </div>

                  <p>₹{item.price * item.quantity}</p>
                </div>
              ))}

              <hr className="my-3" />
              <p className="font-bold text-lg">
                Total: ₹{total}
              </p>
            </div>

            {/* Customer Details */}
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

              <Button onClick={handlePlaceOrder} className="w-full">
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
