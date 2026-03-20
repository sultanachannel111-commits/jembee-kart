"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { getFinalPrice } from "@/lib/priceCalculator";
import { getTheme } from "@/services/themeService";
import { getTextColor } from "@/lib/utils";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [theme, setTheme] = useState<any>({ button: "#ec4899" });

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  /* FETCH PRODUCT */
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
          ...snap.data(),
        };

        setProduct(data);
      } catch (err) {
        console.log("ERROR:", err);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    async function loadThemeData() {
      const t = await getTheme();
      if (t) setTheme(t);
    }
    loadThemeData();
  }, []);

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  if (!product) {
    return <div className="p-5">Product not found</div>;
  }

  // ✅ SAFE VALUES
  const variations = Array.isArray(product.variations) ? product.variations : [];

  const colors = [...new Set(variations.map((v: any) => v?.color).filter(Boolean))];
  const sizes = [...new Set(variations.map((v: any) => v?.size).filter(Boolean))];

  const selectedVariation = variations.find(
    (v: any) => v?.color === selectedColor && v?.size === selectedSize
  );

  const images =
    selectedVariation?.images?.length > 0
      ? selectedVariation.images
      : Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const finalPrice = getFinalPrice(product);

  const price = selectedVariation?.price || finalPrice;

  const stock = product?.stock ?? 0;
  const outOfStock = stock <= 0;

  /* ADD TO CART */
  const handleAddToCart = async () => {
    if (outOfStock) return;

    if (variations.length > 0 && (!selectedColor || !selectedSize)) {
      alert("Select color & size");
      return;
    }

    setAdding(true);

    await addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize,
      price,
      image: images[0] || "",
    });

    setAdding(false);
    router.push("/cart");
  };

  return (
    <div className="min-h-screen pt-[96px] p-4">

      {/* IMAGE */}
      <img
        src={images[activeImage] || "/no-image.png"}
        className="w-full rounded-xl"
      />

      {/* THUMBNAIL */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={img}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-16 rounded-lg object-cover border cursor-pointer
              ${activeImage === i ? "border-green-500" : "border-gray-300"}`}
            />
          ))}
        </div>
      )}

      {/* COLOR */}
      {colors.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Color</p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <div
                key={c}
                onClick={() => {
                  setSelectedColor(c);
                  setActiveImage(0);
                }}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer
                ${selectedColor === c ? "border-black scale-110" : "border-gray-300"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* SIZE */}
      {sizes.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Size</p>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 border rounded-lg
                ${selectedSize === s ? "bg-black text-white" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAME */}
      <h1 className="text-2xl font-bold mt-4">{product?.name || "No Name"}</h1>

      {/* PRICE */}
      <div className="text-2xl font-bold mt-2">
        ₹{price}
      </div>

      {/* STOCK */}
      <p className="mt-2 text-green-600">
        {outOfStock ? "Out of Stock" : `In Stock (${stock})`}
      </p>

      {/* QUANTITY */}
      {!outOfStock && (
        <div className="flex gap-4 mt-4 items-center">
          <button onClick={()=>setQuantity(q=>Math.max(1,q-1))}>-</button>
          <span>{quantity}</span>
          <button onClick={()=>setQuantity(q=>q+1)}>+</button>
        </div>
      )}

      {/* BUTTON */}
      <div className="flex gap-4 mt-6">

        <button
          disabled={adding}
          onClick={handleAddToCart}
          style={{ background: theme.button, color: getTextColor(theme.button) }}
          className="px-6 py-3 rounded w-full"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() =>
            router.push(`/checkout?productId=${product.id}&color=${selectedColor || ""}&size=${selectedSize || ""}`)
          }
          style={{ background: theme.button, color: getTextColor(theme.button) }}
          className="px-6 py-3 rounded w-full"
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}
