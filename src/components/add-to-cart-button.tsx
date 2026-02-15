"use client";

import { addToCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: any) {

  function handleAdd() {
    addToCart(product);
    alert("Product added to cart 🛒");
  }

  return (
    <Button onClick={handleAdd} variant="outline" className="w-full mb-4">
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
}
