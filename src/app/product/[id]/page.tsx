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

  // 🔥 NEW STATES
  const [timeLeft, setTimeLeft] = useState("");
  const [quantity, setQuantity] = useState(1);

  const now = new Date();

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

  /* ---------------- OFFER SYSTEM ---------------- */

  const isOfferActive =
    product?.offerEnd &&
    new Date(product.offerEnd.seconds * 1000) > now;

  const finalPrice = isOfferActive
    ? product.offerPrice
    : product.price;

  const discountPercent =
    isOfferActive && product?.price
      ? Math.round(
          ((product.price - product.offerPrice) /
            product.price) *
            100
        )
      : null;

  useEffect(() => {
    if (!product?.offerEnd) return;

    const interval = setInterval(() => {
      const diff =
        new Date(product.offerEnd.seconds * 1000).getTime() -
        new Date().getTime();

      if (diff <= 0) {
        setTimeLeft("Offer Ended");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(
          (diff % (1000 * 60 * 60)) / (1000 * 60)
        );
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.offerEnd]);

  /* ---------------- CART FUNCTIONS ---------------- */

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: selectedImage,
      price: finalPrice,
      quantity: quantity,
    });
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: selectedImage,
      price: finalPrice,
      quantity: quantity,
    });
    router.push("/checkout");
  };

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

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10">

        {/* IMAGE SECTION */}
        <div>
          <div
            onClick={() => setZoomOpen(true)}
            className="rounded-xl border shadow-lg overflow-hidden cursor-pointer bg-white relative"
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[450px] object-cover hover:scale-110 transition duration-300"
            />

            {discountPercent && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {discountPercent}% OFF
              </div>
            )}
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

          {/* PRICE SECTION */}
          <div className="mb-4">
            <p className="text-3xl text-green-600 font-bold">
              ₹{finalPrice}
            </p>

            {isOfferActive && (
              <div className="mt-2">
                <span className="line-through text-gray-400 mr-3">
                  ₹{product.price}
                </span>
                <span className="text-red-600 font-semibold">
                  🔥 {timeLeft}
                </span>
              </div>
            )}
          </div>

          {/* STOCK */}
          {product.stock && (
            <p className="text-sm text-gray-500 mb-3">
              {product.stock > 5
                ? "In Stock"
                : `Only ${product.stock} left`}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {/* QUANTITY SELECTOR */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() =>
                setQuantity(q => (q > 1 ? q - 1 : 1))
              }
              className="px-3 py-1 border rounded"
            >
              -
            </button>

            <span className="text-lg font-semibold">
              {quantity}
            </span>

            <button
              onClick={() =>
                setQuantity(q => q + 1)
              }
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>

          {/* BUTTONS */}
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

      {/* ZOOM MODAL */}
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
