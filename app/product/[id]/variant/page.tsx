"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";

export default function VariantPage() {

  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);

  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(false);

  // 🔥 FETCH
  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return;

      const data:any = {
        id: snap.id,
        ...snap.data()
      };

      if (!Array.isArray(data.variations)) data.variations = [];

      setProduct(data);
    };

    fetch();
  }, [id]);

  if (!product) return <div className="p-5">Loading...</div>;

  const variations = product.variations || [];

  // 🎯 CURRENT VARIATION
  const selectedVariation = variations.find(
    (v:any)=>v.color===selectedColor && v.size===selectedSize
  );

  // 🖼 IMAGE
  const images =
    selectedVariation?.images?.length > 0
      ? selectedVariation.images
      : [product.image];

  useEffect(()=>{
    setActiveImage(0);
  },[selectedColor,selectedSize]);

  // 🎨 COLORS
  const colors = [...new Set(variations.map((v:any)=>v.color))];

  // 📏 SIZES
  const sizes = [...new Set(variations.map((v:any)=>v.size))];

  // STOCK CHECK
  const isAvailable = (size:any)=>{
    return variations.some(
      (v:any)=>v.size===size && v.color===selectedColor && v.stock > 0
    );
  };

  // 👉 SWIPE
  const handleSwipe = (e:any)=>{
    const start = e.touches[0].clientX;

    const end = (ev:any)=>{
      const endX = ev.changedTouches[0].clientX;

      if(start - endX > 50)
        setActiveImage(p=>Math.min(p+1,images.length-1));

      if(endX - start > 50)
        setActiveImage(p=>Math.max(p-1,0));

      window.removeEventListener("touchend", end);
    };

    window.addEventListener("touchend", end);
  };

  // 🛒 ADD
  const handleAdd = async ()=>{
    if(!selectedVariation) return alert("Select variant");

    await addToCart({
      ...product,
      selectedColor,
      selectedSize,
      price:selectedVariation.price,
      image:images[0],
      quantity:1
    });

    router.push("/cart");
  };

  // ⚡ BUY
  const handleBuy = ()=>{
    if(!selectedVariation) return alert("Select variant");

    router.push(`/checkout?productId=${product.id}&color=${selectedColor}&size=${selectedSize}`);
  };

  return (
    <div className="pb-24 bg-white min-h-screen">

      {/* 🔥 SLIDER */}
      <div
        className="w-full overflow-hidden"
        onTouchStart={handleSwipe}
      >
        <div
          className="flex transition-transform duration-300"
          style={{transform:`translateX(-${activeImage*100}%)`}}
        >
          {images.map((img:any,i:number)=>(
            <img
              key={i}
              src={img}
              onClick={()=>setFullscreen(true)}
              onDoubleClick={()=>setZoom(!zoom)}
              className={`w-full h-[350px] object-contain flex-shrink-0 ${
                zoom ? "scale-150" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_:any,i:number)=>(
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              activeImage===i?"bg-blue-600":"bg-gray-300"
            }`}
          />
        ))}
      </div>

      <div className="p-4">

        {/* 🎨 COLOR */}
        <p className="font-semibold">Color</p>
        <div className="flex gap-3 mt-2">
          {colors.map((c:any)=>(
            <div
              key={c}
              onClick={()=>setSelectedColor(c)}
              className={`w-10 h-10 rounded-full border cursor-pointer ${
                selectedColor===c ? "border-black scale-110" : ""
              }`}
              style={{background:c}}
            />
          ))}
        </div>

        {/* 📏 SIZE */}
        <p className="font-semibold mt-6">Size</p>
        <div className="flex gap-3 mt-2 flex-wrap">

          {sizes.map((s:any)=>{
            const available = isAvailable(s);

            return (
              <div key={s} className="relative">
                <button
                  disabled={!available}
                  onClick={()=>setSelectedSize(s)}
                  className={`px-4 py-2 border rounded ${
                    selectedSize===s ? "bg-black text-white" : ""
                  } ${!available ? "opacity-40" : ""}`}
                >
                  {s}
                </button>

                {!available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[2px] bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* PRICE */}
        <p className="text-2xl font-bold mt-6">
          ₹{selectedVariation?.price || product.sellPrice}
        </p>

      </div>

      {/* 🔥 STICKY */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3">

        <button
          onClick={handleAdd}
          className="w-1/2 border py-3 rounded"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuy}
          className="w-1/2 bg-yellow-400 py-3 rounded font-bold"
        >
          Buy Now
        </button>

      </div>

      {/* 🔥 FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img src={images[activeImage]} className="w-full object-contain"/>
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
