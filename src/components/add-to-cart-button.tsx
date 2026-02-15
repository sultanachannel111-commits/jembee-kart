"use client";

import { Product } from "@/lib/definitions";
import { useCart } from "@/providers/cart-provider";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  function handleAdd() {
    addToCart(product);
  }

  return (
    <Button onClick={handleAdd} className="w-full">
      Add to Cart
    </Button>
  );
}
