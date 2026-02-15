"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;

  const product = {
    id: productId,
    name: "Premium Sneakers",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    description:
      "High quality premium sneakers with comfortable sole.",
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "91706136922";

    const message = `Hello,
I want to order:

Product: ${product.name}
Price: ₹${product.price}
Product ID: ${product.id}

Please confirm availability.`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto p-6 grid md:grid-cols-2 gap-8">
        <div className="relative w-full h-80">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">
            {product.name}
          </h1>

          <p className="text-xl text-green-600 font-semibold mb-4">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleWhatsAppOrder}
          >
            Order on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
