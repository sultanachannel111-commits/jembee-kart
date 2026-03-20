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
  const id = params?.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));

      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data: any = {
        id: snap.id,
        ...snap.data(),
      };

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  // ✅ SAFE VARIATIONS
  const variations = Array.isArray(product.variations)
    ? product.variations
    : [];

  const colors = [...new Set(variations.map(v => v?.color).filter(Boolean))];
  const sizes = [...new Set(variations.map(v => v?.size).filter(Boolean))];

  const selectedVariation = variations.find(
    (v) => v?.color === selectedColor && v?.size === selectedSize
  );

  // ✅ SAFE IMAGE SYSTEM
  const images =
    selectedVariation?.images?.length > 0
      ? selectedVariation.images
      : Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  // ✅ PRICE
  const basePrice = getFinalPrice(product);
  const price = selectedVariation?.price || basePrice;

  const stock = product?.stock ?? 0;

  // ✅ ADD TO CART
  const handleAddToCart = async () => {
    if (variations.length > 0 && (!selectedColor || !selectedSize)) {
      alert("Select color & size");
      return;
    }

    await addToCart({
      ...product,
      selectedColor,
      selectedSize,
      price,
      image: images[0] || "",
    });

    router.push("/cart");
  };

  return (
    <div className="p-4 pt-[90px]">

      {/* 🖼 IMAGE */}
      <img
        src={images[activeImage] || "/no-image.png"}
        className="w-full rounded-xl"
      />

      {/* 🔽 THUMBNAILS */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-16 object-cover rounded border cursor-pointer
              ${activeImage === i ? "border-green-500" : "border-gray-300"}`}
            />
          ))}
        </div>
      )}

      {/* 🎨 COLOR */}
      {colors.length > 0 && (
        <div className="mt-4">
          <p>Color</p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <div
                key={c}
                onClick={() => {
                  setSelectedColor(c);
                  setActiveImage(0);
                }}
                className={`w-8 h-8 rounded-full border cursor-pointer
                ${selectedColor === c ? "border-black scale-110" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 📏 SIZE */}
      {sizes.length > 0 && (
        <div className="mt-4">
          <p>Size</p>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 border rounded
                ${selectedSize === s ? "bg-black text-white" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAME */}
      <h1 className="text-xl font-bold mt-4">{product.name}</h1>

      {/* PRICE */}
      <p className="text-lg font-bold">₹{price}</p>

      {/* STOCK */}
      <p className="text-green-600">In Stock ({stock})</p>

      {/* BUTTON */}
      <button
        onClick={handleAddToCart}
        className="mt-4 w-full bg-green-600 text-white py-3 rounded"
      >
        Add to Cart
      </button>

    </div>
  );
}
