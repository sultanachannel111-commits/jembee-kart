"use client";

import { Product } from "@/lib/definitions";
import { useCart } from "@/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  function handleAdd() {
    addToCart(product);

    toast({
      title: "Added to Cart 🛒",
      description: `${product.name} has been added successfully.`,
    });
  }

  return (
    <Button onClick={handleAdd} className="w-full">
      Add to Cart
    </Button>
  );
}
