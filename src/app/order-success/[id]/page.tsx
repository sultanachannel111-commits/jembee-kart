"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccess() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">

      <div className="text-6xl mb-4">🎉</div>

      <h1 className="text-3xl font-bold mb-2">
        Order Placed Successfully!
      </h1>

      <p className="text-gray-600 mb-2">
        Your Order ID:
      </p>

      <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono mb-6">
        {id}
      </div>

      <Link
        href="/"
        className="bg-pink-600 text-white px-6 py-3 rounded-xl"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
