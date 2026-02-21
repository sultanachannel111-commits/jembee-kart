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

async function handleAdd() {
try {
setLoading(true);

await addToCart({  
    ...product,  
    quantity: 1,  
  });  

} catch (error) {  
  console.error("Add to cart error:", error);  
  alert("Failed to add to cart ❌");  
} finally {  
  setLoading(false);  
}

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
