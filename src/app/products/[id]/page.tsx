"use client";

import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id;

  // Dummy Product (Baad me Firestore se fetch kar sakte ho)
  const product = {
    id: productId,
    name: "Premium Sneakers",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1528701800489-20be3c1a9d84?q=80&w=1200&auto=format&fit=crop",
    description:
      "High quality premium sneakers with stylish design and maximum comfort.",
  };

  const whatsappNumber = "917061369212"; // ✅ YOUR NUMBER

  const message = `
Hello JEMBEE STORE 👋

I want to order this product:

🛍 Product: ${product.name}
💰 Price: ₹${product.price}
🆔 Product ID: ${product.id}

Please confirm availability.
`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* Product Image */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-xl object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="bg-white p-8 rounded-2xl shadow-xl backdrop-blur-lg">
          <h1 className="text-4xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-2xl text-green-600 font-semibold mb-4">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              message
            )}`}
            target="_blank"
            className="block text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-300 shadow-lg"
          >
            Order on WhatsApp 🚀
          </a>

          <p className="text-sm text-gray-400 mt-4">
            100% Genuine | Fast Response | Secure WhatsApp Order
          </p>
        </div>
      </div>
    </div>
  );
}
