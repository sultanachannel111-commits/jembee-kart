"use client";

import { useCart } from "@/providers/cart-provider";
import { Header } from "@/components/header";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const selectedItems = cart.filter((item) =>
    selected.includes(item.id)
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (selected.length === 0) return; // 👈 bas return

    localStorage.setItem(
      "checkoutItems",
      JSON.stringify(selectedItems)
    );

    router.push("/checkout");
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cart.length === 0 && <p>Your cart is empty.</p>}

        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border p-4 mb-4 rounded"
          >
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
            />

            <div className="relative w-20 h-20">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover rounded"
              />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p>₹{item.price}</p>
              <p>Qty: {item.quantity}</p>
            </div>

            <Button
              variant="destructive"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </Button>
          </div>
        ))}

        {cart.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">
              Selected Total: ₹{total}
            </h2>

            <div className="flex gap-4">
              <Button
                onClick={handleCheckout}
                disabled={selected.length === 0}
              >
                Buy Selected
              </Button>

              <Button onClick={clearCart} variant="secondary">
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
