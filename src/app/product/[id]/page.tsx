"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [zoomOpen, setZoomOpen] = useState(false);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          const productData = {
            id: docSnap.id,
            ...data,
          };

          setProduct(productData);

          // Agar images array hai to first image set karo
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          } else {
            setSelectedImage(data.image || "");
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.log("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Product not found
      </div>
    );

  const whatsappLink = `https://wa.me/917061369212?text=Hello, I want to order ${product.name} - ₹${product.price}`;

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10">

        {/* IMAGE SECTION */}
        <div>
          <div
            onClick={() => setZoomOpen(true)}
            className="rounded-xl border shadow-lg overflow-hidden cursor-pointer bg-white"
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[450px] object-cover hover:scale-110 transition duration-300"
            />
          </div>

          {/* THUMBNAILS (If multiple images) */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-4 mt-4 flex-wrap">
              {product.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt="thumb"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg border cursor-pointer transition
                  ${
                    selectedImage === img
                      ? "border-yellow-500 scale-105"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div>
          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-2xl text-green-600 font-semibold mb-4">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <button
            onClick={() => window.open(whatsappLink, "_blank")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition"
          >
            Order on WhatsApp
          </button>
        </div>
      </div>

      {/* FULL SCREEN ZOOM MODAL */}
      {zoomOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setZoomOpen(false)}
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-lg"
          />
        </div>
      )}
    </>
  );
}
