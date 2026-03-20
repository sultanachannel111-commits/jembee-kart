"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { getFinalPrice } from "@/lib/priceCalculator";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // 🔥 FETCH PRODUCT
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        setProduct({
          id: snap.id,
          ...snap.data()
        });

        setLoading(false);

      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔄 LOADING
  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  const finalPrice = getFinalPrice(product);

  // ✅ SAFE IMAGES
  const images = [
    product?.image,
    product?.frontImage,
    product?.backImage,
    product?.sideImage
  ].filter((img) => img && typeof img === "string");

  const finalImages = images.length > 0 ? images : ["/no-image.png"];

  // 👉 SWIPE
  const handleSwipe = (e: any) => {
    const startX = e.touches[0].clientX;

    const end = (ev: any) => {
      const endX = ev.changedTouches[0].clientX;

      if (startX - endX > 50)
        setActiveImage((p) => Math.min(p + 1, finalImages.length - 1));

      if (endX - startX > 50)
        setActiveImage((p) => Math.max(p - 1, 0));

      window.removeEventListener("touchend", end);
    };

    window.addEventListener("touchend", end);
  };

  // 🛒 ADD TO CART
  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      image: finalImages[0]
    });
    router.push("/cart");
  };

  // ⚡ BUY NOW
  const handleBuyNow = () => {
    router.push(`/checkout?productId=${product.id}`);
  };

  return (
    <div className="min-h-screen pt-[96px] p-4">

      {/* 🔥 IMAGE SLIDER */}
      <div
        className="w-full -mx-4 overflow-hidden relative"
        onTouchStart={handleSwipe}
      >
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
        >
          {finalImages.map((img: any, i: number) => (
            <img
              key={i}
              src={img}
              onClick={() => setFullscreen(true)}
              className="w-full h-[320px] object-cover flex-shrink-0"
            />
          ))}
        </div>

        {/* 🔵 DOTS */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {finalImages.map((_: any, i: number) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                activeImage === i ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 🔥 THUMBNAILS */}
      {finalImages.length > 1 && (
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {finalImages.map((img: any, i: number) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              className={`p-[2px] rounded-lg cursor-pointer ${
                activeImage === i
                  ? "border-2 border-green-500"
                  : "border border-gray-300"
              }`}
            >
              <img src={img} className="w-16 h-16 object-cover rounded" />
            </div>
          ))}
        </div>
      )}

      {/* 🧾 PRODUCT INFO */}
      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>

      <p className="text-2xl font-bold mt-2">
        ₹{finalPrice}
      </p>

      <p className="text-green-600 mt-1">
        In Stock ({product.stock})
      </p>

      {/* 🛒 BUTTONS */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={handleAddToCart}
          className="w-full bg-green-600 text-white py-3 rounded"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Buy Now
        </button>

      </div>

      {/* 🔥 FULLSCREEN VIEW */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img
            src={finalImages[activeImage]}
            className="w-full object-contain"
          />
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
