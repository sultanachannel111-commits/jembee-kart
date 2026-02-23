"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
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

  /* ---------------- CART FUNCTIONS ---------------- */

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: selectedImage,
      price: product.price,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: selectedImage,
      price: product.price,
      quantity: 1,
    });
    router.push("/checkout");
  };

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

          {/* 🔥 NEW BUTTONS */}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-lg shadow-lg transition"
            >
              🛒 Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg shadow-lg transition"
            >
              ⚡ Buy Now
            </button>
          </div>
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
