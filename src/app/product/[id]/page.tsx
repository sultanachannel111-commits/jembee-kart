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
  const id = typeof params?.id === "string" ? params.id : "";

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const [theme, setTheme] = useState<any>({
    button: "#22c55e"
  });

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

        const data:any = {
          id: snap.id,
          ...snap.data()
        };

        // 🔥 OFFERS
        const offerSnap = await getDocs(collection(db,"offers"));
        let discount = 0;

        offerSnap.forEach((doc)=>{
          const offer:any = doc.data();

          if(!offer?.active) return;

          if(offer.type === "product" && offer.productId === id){
            discount = offer.discount;
          }

          if(
            offer.type === "category" &&
            offer.category?.toLowerCase?.() === data.category?.toLowerCase?.()
          ){
            discount = offer.discount;
          }
        });

        data.discount = discount;

        setProduct(data);
        setLoading(false);

      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔥 THEME LOAD (ADMIN PANEL FIX)
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

  // ✅ IMAGES FIX
  const images = [
    product?.image,
    product?.frontImage,
    product?.backImage,
    product?.sideImage
  ].filter((img) => typeof img === "string" && img !== "");

  const finalImages = images.length ? images : ["/no-image.png"];

  // 👉 SWIPE (SMOOTH)
  const handleSwipe = (e:any) => {
    const startX = e.touches[0].clientX;

    const end = (ev:any) => {
      const endX = ev.changedTouches[0].clientX;

      if (startX - endX > 50)
        setActiveImage((p)=>Math.min(p+1, finalImages.length-1));

      if (endX - startX > 50)
        setActiveImage((p)=>Math.max(p-1, 0));

      window.removeEventListener("touchend", end);
    };

    window.addEventListener("touchend", end);
  };

  // 🛒 ADD TO CART
  const handleAddToCart = async () => {
    await addToCart({
      ...product,
      quantity: 1,
      image: finalImages[activeImage]
    });
    router.push("/cart");
  };

  // ⚡ BUY NOW
  const handleBuyNow = () => {
    router.push(`/checkout?productId=${product.id}`);
  };

  return (
    <div className="min-h-screen pt-[96px] bg-white">

      {/* 🔥 FULL WIDTH SLIDER (FLIPKART STYLE) */}
      <div
        className="w-full overflow-hidden relative"
        onTouchStart={handleSwipe}
      >
        <div
          className="flex transition-transform duration-300"
          style={{
            transform: `translateX(-${activeImage * 100}%)`
          }}
        >
          {finalImages.map((img:any, i:number)=>(
            <img
              key={i}
              src={img}
              onClick={()=>setFullscreen(true)}
              className="w-full h-[380px] object-contain bg-white flex-shrink-0"
            />
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {finalImages.map((_:any,i:number)=>(
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                activeImage===i ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4">

        {/* 🔥 THUMBNAILS */}
        {finalImages.length > 1 && (
          <div className="flex gap-3 mt-3 overflow-x-auto">
            {finalImages.map((img:any,i:number)=>(
              <div
                key={i}
                onClick={()=>setActiveImage(i)}
                className={`p-[2px] rounded-xl cursor-pointer ${
                  activeImage===i
                    ? "border-2 border-green-500 scale-105"
                    : "border border-gray-300"
                }`}
              >
                <img
                  src={img}
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}

        {/* NAME */}
        <h1 className="text-2xl font-bold mt-4">
          {product.name}
        </h1>

        {/* PRICE */}
        <div className="flex gap-3 items-center mt-2">
          <span className="text-2xl font-bold">
            ₹{finalPrice}
          </span>

          {product.discount > 0 && (
            <>
              <span className="line-through text-gray-400">
                ₹{product.sellPrice}
              </span>
              <span className="text-red-500 text-sm font-bold">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>

        {/* STOCK */}
        <p className="mt-2 text-green-600 font-semibold">
          In Stock ({product.stock})
        </p>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-6">

          <button
            onClick={handleAddToCart}
            style={{
              background: theme.button,
              color: getTextColor(theme.button)
            }}
            className="w-full py-3 rounded-xl"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            style={{
              background: theme.button,
              color: getTextColor(theme.button)
            }}
            className="w-full py-3 rounded-xl"
          >
            Buy Now
          </button>

        </div>

      </div>

      {/* 🔥 FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img
            src={finalImages[activeImage]}
            className="w-full object-contain"
          />
          <button
            onClick={()=>setFullscreen(false)}
            className="absolute top-4 right-4 text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
