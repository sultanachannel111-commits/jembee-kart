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
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);

  // 🔥 FETCH
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        const data: any = {
          id: snap.id,
          ...snap.data()
        };

        // ✅ SAFE VARIATION
        if (!Array.isArray(data.variations)) {
          data.variations = [];
        }

        setProduct(data);
        setLoading(false);

      } catch (err) {
        console.log("ERROR:", err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  const variations = Array.isArray(product.variations)
    ? product.variations
    : [];

  // 🎯 SELECTED VARIATION
  const selectedVariation = variations.find(
    (v: any) =>
      v?.color === selectedColor &&
      v?.size === selectedSize
  );

  // 🖼 IMAGES
  const baseImages = [
    product?.image,
    product?.frontImage,
    product?.backImage,
    product?.sideImage
  ].filter((img) => typeof img === "string" && img !== "");

  const images =
    selectedVariation?.images && Array.isArray(selectedVariation.images)
      ? selectedVariation.images
      : baseImages.length > 0
      ? baseImages
      : ["/no-image.png"];

  // RESET IMAGE
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor, selectedSize]);

  // 🎨 COLORS
  const colors = [
    ...new Set(
      variations.map((v: any) => v?.color).filter(Boolean)
    )
  ];

  // 📏 SIZES
  const sizes = [
    ...new Set(
      variations
        .filter((v: any) => v?.color === selectedColor)
        .map((v: any) => v?.size)
        .filter(Boolean)
    )
  ];

  // 💰 PRICE
  const price =
    selectedVariation?.price ?? getFinalPrice(product);

  // 🛒 ADD TO CART
  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedColor,
      selectedSize,
      image: images[0],
      quantity: 1
    });
    router.push("/cart");
  };

  // ⚡ BUY NOW
  const handleBuyNow = () => {
    router.push(
      `/checkout?productId=${product.id}&color=${selectedColor || ""}&size=${selectedSize || ""}`
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-24">

      {/* IMAGE */}
      <img
        src={images[activeImage]}
        className="w-full h-[300px] object-contain"
      />

      {/* THUMB */}
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {images.map((img: any, i: number) => (
          <img
            key={i}
            src={img}
            onClick={() => setActiveImage(i)}
            className={`w-16 h-16 rounded cursor-pointer border ${
              activeImage === i ? "border-green-500" : ""
            }`}
          />
        ))}
      </div>

      {/* NAME */}
      <h1 className="text-xl font-bold mt-4">{product.name}</h1>

      {/* PRICE */}
      <p className="text-2xl font-bold mt-1">₹{price}</p>

      {/* 🎨 COLOR */}
      {colors.length > 0 && (
        <div className="mt-4">
          <p>Color</p>
          <div className="flex gap-2 mt-2">
            {colors.map((c: any) => (
              <div
                key={c}
                onClick={() => {
                  setSelectedColor(c);
                  setSelectedSize(null);
                }}
                className={`w-8 h-8 rounded-full border cursor-pointer ${
                  selectedColor === c ? "border-black scale-110" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 📏 SIZE */}
      {sizes.length > 0 && (
        <div className="mt-4">
          <p>Size</p>
          <div className="flex gap-2 mt-2">
            {sizes.map((s: any) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 border rounded ${
                  selectedSize === s ? "bg-black text-white" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 BUTTONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3">

        <button
          onClick={handleAddToCart}
          className="w-1/2 py-3 rounded border"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="w-1/2 py-3 rounded bg-yellow-400 font-bold"
        >
          Buy Now ₹{price}
        </button>

      </div>

    </div>
  );
}
