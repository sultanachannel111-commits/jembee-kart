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
  const [activeImage, setActiveImage] = useState(0);

  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);

  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const [theme, setTheme] = useState<any>({ button: "#ec4899" });

  // ✅ FETCH PRODUCT
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

        // 🔥 SAFE VARIATION FIX
        if (!Array.isArray(data.variations)) {
          data.variations = [];
        }

        const offerSnap = await getDocs(collection(db, "offers"));

        let discount = 0;

        offerSnap.forEach((doc) => {
          const offer: any = doc.data();

          if (!offer?.active) return;

          if (offer.type === "product" && offer.productId === id) {
            discount = offer.discount;
          }

          if (
            offer.type === "category" &&
            offer.category?.toLowerCase?.() === data.category?.toLowerCase?.()
          ) {
            discount = offer.discount;
          }
        });

        data.discount = discount;

        setProduct(data);
        setLoading(false);

      } catch (err) {
        console.log("ERROR:", err);
        setLoading(false);
      }
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

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  const finalPrice = getFinalPrice(product);

  const variations = product?.variations || [];

  const selectedVariation = variations.find(
    (v: any) =>
      v?.color === selectedColor &&
      v?.size === selectedSize
  );

  // ✅ SAFE IMAGE ARRAY (NO CRASH)
  const baseImages = [
    product?.image,
    product?.frontImage,
    product?.backImage,
    product?.sideImage
  ].filter((img) => typeof img === "string" && img !== "");

  const images =
    selectedVariation?.images && Array.isArray(selectedVariation.images)
      ? selectedVariation.images
      : baseImages;

  // reset image
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor, selectedSize]);

  const outOfStock = !product?.stock || product.stock <= 0;

  const handleAddToCart = async () => {
    if (outOfStock) return;

    setAdding(true);

    await addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize,
      image: images[0] || ""
    });

    setAdding(false);
    router.push("/cart");
  };

  // 🔥 SWIPE FIX
  const handleSwipe = (e: any) => {
    const startX = e.touches[0].clientX;

    const end = (ev: any) => {
      const endX = ev.changedTouches[0].clientX;

      if (startX - endX > 50)
        setActiveImage((p) => Math.min(p + 1, images.length - 1));

      if (endX - startX > 50)
        setActiveImage((p) => Math.max(p - 1, 0));

      window.removeEventListener("touchend", end);
    };

    window.addEventListener("touchend", end);
  };

  return (
    <div className="min-h-screen pt-[96px] p-4">

      {/* 🔥 SLIDER */}
      <div
        className="w-full -mx-4 overflow-hidden relative"
        onTouchStart={handleSwipe}
      >
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
        >
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={img}
              onClick={() => setFullscreen(true)}
              onDoubleClick={() => setZoom(!zoom)}
              className={`w-full h-[320px] object-cover flex-shrink-0 ${
                zoom ? "scale-150" : ""
              }`}
            />
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {images.map((_: any, i: number) => (
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
      {images.length > 1 && (
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {images.map((img: any, i: number) => (
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

      {/* 🎨 COLOR */}
      {variations.length > 0 && (
        <div className="mt-4">
          <p>Color</p>
          <div className="flex gap-2">
            {[...new Set(variations.map((v: any) => v.color).filter(Boolean))].map((c: any) => (
              <div
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-8 h-8 rounded-full border ${
                  selectedColor === c ? "scale-110 border-black" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 📏 SIZE */}
      {variations.length > 0 && (
        <div className="mt-4">
          <p>Size</p>
          <div className="flex gap-2">
            {[...new Set(variations.map((v: any) => v.size).filter(Boolean))].map((s: any) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 border ${
                  selectedSize === s ? "bg-black text-white" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAME */}
      <h1 className="text-2xl font-bold mt-4">{product?.name}</h1>

      {/* PRICE */}
      <p className="text-2xl font-bold mt-2">
        ₹{selectedVariation?.price || finalPrice}
      </p>

      {/* BUTTON */}
      <button
        onClick={handleAddToCart}
        className="mt-4 w-full py-3 rounded"
        style={{
          background: theme.button,
          color: getTextColor(theme.button)
        }}
      >
        Add to Cart
      </button>

      {/* 🔥 FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img src={images[activeImage]} className="w-full object-contain" />
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
