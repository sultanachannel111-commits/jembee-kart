"use client";

import { Product } from "@/lib/definitions";
import { useCart } from "@/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  function handleAdd() {
    setLoading(true);

    addToCart(product);

    // small delay for better UX
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  return (
    <Button
      onClick={handleAdd}
      className="w-full"
      disabled={loading}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
