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
      const snap = await getDoc(doc(db, "products", id));

      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data: any = {
        id: snap.id,
        ...snap.data()
      };

      if (!Array.isArray(data.variations)) {
        data.variations = [];
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  const variations = product.variations || [];

  // 🎯 SELECTED VARIATION
  const selectedVariation = variations.find(
    (v: any) =>
      v.color === selectedColor &&
      v.size === selectedSize
  );

  // 🖼 IMAGE
  const baseImages = [
    product?.image,
    product?.frontImage,
    product?.backImage,
    product?.sideImage
  ].filter(Boolean);

  const images =
    selectedVariation?.images?.length > 0
      ? selectedVariation.images
      : baseImages;

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor, selectedSize]);

  // 🎨 COLORS
  const colors = [...new Set(variations.map((v:any)=>v.color))];

  // 📏 SIZES
  const sizes = [
    ...new Set(
      variations
        .filter((v:any)=>v.color === selectedColor)
        .map((v:any)=>v.size)
    )
  ];

  // 💰 PRICE
  const price =
    selectedVariation?.price || getFinalPrice(product);

  // 📦 STOCK
  const stock =
    selectedVariation?.stock ?? product.stock;

  // 🛒 ADD
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
    router.push(`/checkout?productId=${product.id}`);
  };

  return (
    <div className="pb-24 bg-white min-h-screen">

      {/* 🔥 IMAGE */}
      <img
        src={images[activeImage]}
        className="w-full h-[350px] object-contain"
      />

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_:any,i:number)=>(
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              activeImage===i ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* THUMB */}
      <div className="flex gap-2 mt-3 px-4 overflow-x-auto">
        {images.map((img:any,i:number)=>(
          <div
            key={i}
            onClick={()=>setActiveImage(i)}
            className={`p-[2px] rounded ${
              activeImage===i
              ? "border-2 border-green-500"
              : "border"
            }`}
          >
            <img src={img} className="w-16 h-16 rounded"/>
          </div>
        ))}
      </div>

      <div className="p-4">

        {/* NAME */}
        <h1 className="text-xl font-bold">{product.name}</h1>

        {/* PRICE */}
        <p className="text-2xl font-bold mt-1">₹{price}</p>

        {/* STOCK */}
        <p className="text-green-600 text-sm mt-1">
          {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
        </p>

        {/* 🎨 COLOR */}
        {colors.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Color</p>

            <div className="flex gap-2 mt-2">
              {colors.map((c:any)=>(
                <div
                  key={c}
                  onClick={()=>setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border cursor-pointer ${
                    selectedColor===c ? "border-black scale-110" : ""
                  }`}
                  style={{background:c}}
                />
              ))}
            </div>
          </div>
        )}

        {/* 📏 SIZE */}
        {sizes.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Size</p>

            <div className="flex gap-2 mt-2">
              {sizes.map((s:any)=>(
                <button
                  key={s}
                  onClick={()=>setSelectedSize(s)}
                  className={`px-3 py-1 border rounded ${
                    selectedSize===s ? "bg-black text-white" : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 🔥 STICKY BAR */}
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
