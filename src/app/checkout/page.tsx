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

  // Load selected items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("checkoutItems");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (!name || !address) {
      return;
    }

    // Clear cart
    clearCart();

    // Remove checkout storage
    localStorage.removeItem("checkoutItems");

    // Redirect to success page
    router.push("/order-success");
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
              <h2 className="font-semibold mb-3">Order Summary</h2>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                  </div>

                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}

              <hr className="my-3" />
              <p className="font-bold text-lg">Total: ₹{total}</p>
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
