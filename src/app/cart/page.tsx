"use client";

import { useCart } from "@/providers/cart-provider";
import { Header } from "@/components/header";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
              Total: ₹{total}
            </h2>

            <Button onClick={clearCart} variant="secondary">
              Clear Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
