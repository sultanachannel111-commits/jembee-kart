"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function VariantPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // 🔥 FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      const ref = doc(db, "products", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);

        // default select first variant
        if (data?.variations?.length > 0) {
          const first = data.variations[0];
          setSelectedColor(first.color);
          setSelectedSize(first.size);
          setSelectedVariant(first);
        }
      }
    };

    fetchProduct();
  }, [id]);

  // 🔥 UPDATE VARIANT
  useEffect(() => {
    if (!product?.variations) return;

    const found = product.variations.find(
      (v: any) =>
        v.color === selectedColor && v.size === selectedSize
    );

    if (found) setSelectedVariant(found);
  }, [selectedColor, selectedSize, product]);

  if (!product) return <div className="p-4">Loading...</div>;

  const variations = product?.variations || [];

  // unique colors
  const colors = [...new Set(variations.map((v: any) => v.color))];

  // sizes based on selected color
  const sizes = variations.filter(
    (v: any) => v.color === selectedColor
  );

  return (
    <div className="p-4">

      {/* 🔥 IMAGE */}
      <div className="w-full">
        <img
          src={selectedVariant?.images?.[0] || "/placeholder.png"}
          className="w-full h-[300px] object-cover rounded-xl"
        />
      </div>

      {/* 🔥 GALLERY */}
      <div className="flex gap-2 mt-2 overflow-x-auto">
        {(selectedVariant?.images || []).map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            className="w-20 h-20 border rounded"
          />
        ))}
      </div>

      {/* 🔥 PRICE */}
      <h2 className="text-xl font-bold mt-4">
        ₹ {selectedVariant?.price}
      </h2>

      {/* 🔥 COLORS */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Color</h3>
        <div className="flex gap-3">
          {colors.map((color: any, i: number) => (
            <div
              key={i}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                selectedColor === color
                  ? "border-black"
                  : "border-gray-300"
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* 🔥 SIZES */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Size</h3>
        <div className="flex gap-3">
          {sizes.map((v: any, i: number) => {
            const isOut = v.stock <= 0;

            return (
              <div
                key={i}
                onClick={() => !isOut && setSelectedSize(v.size)}
                className={`px-4 py-2 border rounded cursor-pointer relative ${
                  selectedSize === v.size
                    ? "border-black"
                    : "border-gray-300"
                } ${isOut ? "opacity-40" : ""}`}
              >
                {v.size}

                {/* ❌ CUT MARK */}
                {isOut && (
                  <div className="absolute top-0 left-0 w-full h-full border-t-2 border-red-500 rotate-45"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔥 STOCK */}
      <div className="mt-3 text-sm">
        {selectedVariant?.stock > 0
          ? `In Stock (${selectedVariant.stock})`
          : "Out of Stock"}
      </div>

      {/* 🔥 BUTTON */}
      <button
        className="w-full bg-black text-white py-3 rounded mt-6"
        disabled={!selectedVariant || selectedVariant.stock <= 0}
      >
        Buy Now
      </button>
    </div>
  );
}
