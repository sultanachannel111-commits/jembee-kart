"use client";

import { useCart } from "@/providers/cart-provider";
import { Product } from "@/lib/definitions";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  function handleAdd() {
    addToCart(product);
  }

  return (
    <button
      onClick={handleAdd}
      className="bg-primary text-white px-4 py-2 rounded-md"
    >
      Add to Cart
    </button>
  );
}
