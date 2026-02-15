"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;

  const product = {
    id: productId,
    name: "Premium Sneakers",
    price: 999,
  };

  const handleOrder = async () => {
    const orderRef = await addDoc(collection(db, "orders"), {
      orderId: "ORD-" + Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    const phone = "91706136922";

    const message = `Hello,
Order ID: ${orderRef.id}
Product: ${product.name}
Price: ₹${product.price}`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div>
      <Header />
      <div className="p-10">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl">₹{product.price}</p>

        <Button
          className="mt-5 bg-green-600"
          onClick={handleOrder}
        >
          Order on WhatsApp
        </Button>
      </div>
    </div>
  );
}
