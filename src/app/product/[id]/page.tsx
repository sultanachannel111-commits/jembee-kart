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

  // 🔥 IMAGE + VARIATION STATE
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);

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

        // 🔥 OFFERS
        const offerSnap = await getDocs(collection(db, "offers"));
        let discount = 0;

        offerSnap.forEach((doc) => {
          const offer: any = doc.data();

          if (!offer.active) return;

          if (
            offer.type === "product" &&
            offer.productId === id
          ) {
            discount = offer.discount;
          }

          if (
            offer.type === "category" &&
            offer.category?.toLowerCase().trim() ===
              data.category?.toLowerCase().trim()
          ) {
            discount = offer.discount;
          }
        });

        data.discount = discount;

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const finalPrice = getFinalPrice(product);

  const variations = product?.variations || [];

  const colors = [...new Set(variations.map((v: any) => v.color))];
  const sizes = [...new Set(variations.map((v: any) => v.size))];

  const selectedVariation = variations.find(
    (v: any) => v.color === selectedColor && v.size === selectedSize
  );

  // ✅ SAFE IMAGE SYSTEM
  const images =
    selectedVariation?.images?.length > 0
      ? selectedVariation.images
      : product?.images?.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const outOfStock = !product.stock || product.stock <= 0;

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
      price: selectedVariation?.price || finalPrice,
      image: images[0],
    });

    setAdding(false);
    router.push("/cart");
  };

  return (
    <div className="min-h-screen pt-[96px] p-4">

      {/* 🖼️ MAIN IMAGE */}
      <img
        src={images[activeImage] || "/no-image.png"}
        className="w-full rounded-xl"
      />

      {/* 🔽 THUMBNAILS */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={img}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-16 object-cover rounded-lg cursor-pointer border
              ${activeImage === i ? "border-green-500" : "border-gray-300"}`}
            />
          ))}
        </div>
      )}

      {/* 🎨 COLOR */}
      {colors.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Color</p>
          <div className="flex gap-2">
            {colors.map((c: any) => (
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

      {/* 📏 SIZE */}
      {sizes.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Size</p>
          <div className="flex gap-2">
            {sizes.map((s: any) => (
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
      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>

      {/* PRICE */}
      <div className="text-2xl font-bold mt-2">
        ₹{selectedVariation?.price || finalPrice}
      </div>

      {/* STOCK */}
      <p className="mt-2 text-green-600">
        {outOfStock ? "Out of Stock" : `In Stock (${product.stock})`}
      </p>

      {/* QUANTITY */}
      {!outOfStock && (
        <div className="flex items-center gap-4 mt-4">
          <button onClick={()=>setQuantity(q=>Math.max(1,q-1))} className="bg-gray-200 px-4 py-2 rounded">-</button>
          <span>{quantity}</span>
          <button onClick={()=>setQuantity(q=>q+1)} className="bg-gray-200 px-4 py-2 rounded">+</button>
        </div>
      )}

      {/* BUTTONS */}
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
            router.push(`/checkout?productId=${product.id}&color=${selectedColor}&size=${selectedSize}`)
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
