"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const products = [
  {
    id: "1",
    name: "Premium Sneakers",
    price: 999,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
      "https://images.unsplash.com/photo-1584735175315-9d5df23860e6",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      "https://images.unsplash.com/photo-1519741497674-611481863552",
    ],
    description: "High quality stylish sneakers for daily wear.",
  },
];

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState(
    product?.images[0] || ""
  );
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!product) return <div className="p-10">Product not found</div>;

  const whatsappLink = `https://wa.me/917061369212?text=I want to order ${product.name}`;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-10">

      {/* IMAGE SECTION */}
      <div>
        <div
          className="overflow-hidden rounded-xl border shadow-lg cursor-zoom-in group"
          onClick={() => setZoomOpen(true)}
        >
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* THUMBNAILS */}
        <div className="flex gap-4 mt-4">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="thumb"
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 object-cover rounded-lg border cursor-pointer transition-all duration-300
              ${
                selectedImage === img
                  ? "border-yellow-500 scale-105 shadow-lg"
                  : "border-gray-300 hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-2xl text-green-600 font-semibold">
          ₹{product.price}
        </p>

        <p className="text-gray-600">{product.description}</p>

        <a
          href={whatsappLink}
          target="_blank"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
        >
          Order on WhatsApp
        </a>
      </div>

      {/* FULL SCREEN ZOOM MODAL */}
      {zoomOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setZoomOpen(false)}
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
