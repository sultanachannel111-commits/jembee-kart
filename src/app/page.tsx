"use client";

import { Header } from "@/components/header";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const products = [
    {
      id: "1",
      name: "Premium Sneakers",
      price: 999,
      image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    },
    {
      id: "2",
      name: "Stylish T-Shirt",
      price: 499,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Premium Products
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl shadow cursor-pointer"
              onClick={() =>
                router.push(`/products/${product.id}`)
              }
            >
              <div className="relative w-full h-40">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <p className="font-semibold mt-3">
                {product.name}
              </p>
              <p className="text-green-600 font-bold">
                ₹{product.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
