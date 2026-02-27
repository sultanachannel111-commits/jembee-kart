"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [viewers, setViewers] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });

          if (data?.images?.length > 0) {
            setSelectedImage(data.images[0]);
          } else {
            setSelectedImage(data?.image || "");
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

  /* ---------------- RANDOM DATA ---------------- */
  useEffect(() => {
    setViewers(Math.floor(Math.random() * 15) + 5);
    setSoldCount(Math.floor(Math.random() * 200) + 50);

    const future = new Date();
    future.setDate(future.getDate() + 3);
    setDeliveryDate(
      future.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  /* ---------------- OFFER ---------------- */

  const isOfferActive =
    product?.offerEnd?.seconds &&
    new Date(product.offerEnd.seconds * 1000) > new Date();

  const finalPrice = isOfferActive
    ? product?.offerPrice ?? product?.price
    : product?.sellingPrice ?? product?.price ?? 0;

  const discountPercent =
    isOfferActive &&
    product?.sellingPrice &&
    product?.offerPrice
      ? Math.round(
          ((product.sellingPrice - product.offerPrice) /
            product.sellingPrice) *
            100
        )
      : null;

  /* ---------------- COUNTDOWN ---------------- */

  useEffect(() => {
    if (!product?.offerEnd?.seconds) return;

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
  }, [product?.offerEnd?.seconds]);

  /* ---------------- FIRESTORE CART ---------------- */

  const handleAddToCart = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      if (!product?.stock || product.stock === 0) {
        alert("Product is out of stock");
        return;
      }

      if (quantity > product.stock) {
        alert("Not enough stock available");
        return;
      }

      const cartRef = doc(db, "cart", user.uid);
      const snap = await getDoc(cartRef);

      let updatedProducts = [];

      if (snap.exists()) {
        const existingProducts = snap.data().products || [];

        const existingIndex = existingProducts.findIndex(
          (item: any) => item.id === product.id
        );

        if (existingIndex >= 0) {
          existingProducts[existingIndex].quantity += quantity;
          updatedProducts = existingProducts;
        } else {
          updatedProducts = [
            ...existingProducts,
            {
              id: product.id,
              name: product.name,
              image: selectedImage,
              price: finalPrice,
              quantity,
            },
          ];
        }
      } else {
        updatedProducts = [
          {
            id: product.id,
            name: product.name,
            image: selectedImage,
            price: finalPrice,
            quantity,
          },
        ];
      }

      await setDoc(cartRef, { products: updatedProducts });

      alert("Added to Cart ✅");

    } catch (error) {
      console.log("Cart Error:", error);
      alert("Something went wrong ❌");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
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
        {/* IMAGE */}
        <div>
          <div
            onClick={() => setZoomOpen(true)}
            className="rounded-xl border shadow-lg overflow-hidden cursor-pointer bg-white relative"
          >
            <img
              src={selectedImage}
              alt={product?.name}
              className="w-full h-[450px] object-cover"
            />

            {discountPercent && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                {discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          {product?.category && (
            <Link
              href={`/category/${product.category}`}
              className="text-sm text-pink-600 font-medium"
            >
              {product.category}
            </Link>
          )}

          <h1 className="text-3xl font-bold mt-2">
            {product?.name}
          </h1>

          <p className="text-3xl text-green-600 font-bold mt-3">
            ₹{finalPrice}
          </p>

          {isOfferActive && (
            <div className="mt-2">
              <span className="line-through text-gray-400 mr-3">
                ₹{product?.sellingPrice}
              </span>
              <span className="text-red-600 font-semibold">
                🔥 {timeLeft}
              </span>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-600">
            👀 {viewers} people viewing
          </div>

          <div className="text-sm text-red-600 font-semibold mt-1">
            🔥 {soldCount}+ sold recently
          </div>

          <div className="text-sm text-green-600 mt-2">
            📦 Get it by <span className="font-semibold">{deliveryDate}</span>
          </div>

          <p className="text-gray-600 mt-4">
            {product?.description}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              className="px-3 py-1 border rounded"
            >
              -
            </button>

            <span className="text-lg font-semibold">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 rounded-lg"
            >
              🛒 Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-pink-600 text-white py-3 rounded-lg"
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>

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
