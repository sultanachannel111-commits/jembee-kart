"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { getFinalPrice } from "@/lib/priceCalculator";
import { getTheme } from "@/services/themeService";
import { getTextColor } from "@/lib/utils";

export default function ProductPage() {

  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const [theme, setTheme] = useState<any>({
    button: "#22c55e"
  });

  // 🔥 VARIATION STATE
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

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

  // 🔥 THEME
  useEffect(() => {
    async function loadThemeData() {
      const t = await getTheme();
      if (t) setTheme(t);
    }
    loadThemeData();
  }, []);

  // 🔥 DEFAULT VARIANT
  useEffect(() => {
    if (product?.variations?.length) {
      const first = product.variations[0];
      setSelectedColor(first.color);
      setSelectedSize(first.size);
      setSelectedVariant(first);
    }
  }, [product]);

  // 🔥 UPDATE VARIANT
  useEffect(() => {
    if (!product?.variations) return;

    const found = product.variations.find(
      (v: any) =>
        v.color === selectedColor && v.size === selectedSize
    );

    if (found) setSelectedVariant(found);
  }, [selectedColor, selectedSize, product]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  const finalPrice = getFinalPrice(product);

  // 🔥 IMAGE SOURCE
  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : [
        product?.image,
        product?.frontImage,
        product?.backImage,
        product?.sideImage
      ].filter((img) => img);

  const finalImages = images.length ? images : ["/no-image.png"];

  // 🔥 COLORS
  const colors = [...new Set(product?.variations?.map((v:any)=>v.color))];

  // 🔥 SIZES
  const sizes = product?.variations?.filter(
    (v:any)=>v.color===selectedColor
  );

  // 👉 SWIPE
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

  return (
    <div className="min-h-screen bg-white pt-[96px]">

      {/* 🔥 IMAGE SLIDER */}
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

        {/* NAME */}
        <h1 className="text-2xl font-bold mt-4">
          {product.name}
        </h1>

        {/* PRICE */}
        <div className="flex gap-3 items-center mt-2">
          <span className="text-2xl font-bold">
            ₹{selectedVariant?.price || finalPrice}
          </span>
        </div>

        {/* STOCK */}
        <p className="mt-2 text-green-600 font-semibold">
          In Stock ({selectedVariant?.stock ?? product.stock})
        </p>

        {/* 🔥 COLOR */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Color</h3>
          <div className="flex gap-3">
            {colors.map((color:any,i:number)=>(
              <div
                key={i}
                onClick={()=>setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? "border-black" : "border-gray-300"
                }`}
                style={{background:color}}
              />
            ))}
          </div>
        </div>

        {/* 🔥 SIZE */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Size</h3>
          <div className="flex gap-3">
            {sizes.map((v:any,i:number)=>(
              <div
                key={i}
                onClick={()=>setSelectedSize(v.size)}
                className={`px-4 py-2 border rounded ${
                  selectedSize === v.size ? "border-black" : "border-gray-300"
                }`}
              >
                {v.size}
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 BUY BUTTON */}
        <button
          style={{
            background: theme.button,
            color: getTextColor(theme.button)
          }}
          className="w-full py-3 rounded-xl mt-6"
        >
          Buy Now
        </button>

      </div>

      {/* FULLSCREEN */}
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
