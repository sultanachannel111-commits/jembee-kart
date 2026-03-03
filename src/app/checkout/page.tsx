"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const payNow = () => {
    router.push(`/payment?amount=${total}`);
  };

  return (
    <div className="p-6 pt-[100px]">
      <h1 className="text-xl font-bold mb-6">Order Summary</h1>

      {cartItems.map(item => (
        <div key={item.id} className="flex justify-between mb-2">
          <span>{item.name}</span>
          <span>₹{item.price}</span>
        </div>
      ))}

      <div className="mt-6 font-bold text-lg">
        Total: ₹{total}
      </div>

      <button
        onClick={payNow}
        className="bg-black text-white w-full py-3 mt-6 rounded-xl"
      >
        Pay with UPI
      </button>
    </div>
  );
}
