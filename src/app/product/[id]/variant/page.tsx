"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function VariantPage() {

  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);

  const [selectedColor,setSelectedColor] = useState("");
  const [selectedSize,setSelectedSize] = useState("");

  const [activeImage,setActiveImage] = useState(0);
  const [fullscreen,setFullscreen] = useState(false);

  // 🔥 FETCH PRODUCT
  useEffect(()=>{
    if(!id) return;

    const fetchData = async()=>{
      try{
        const snap = await getDoc(doc(db,"products",id));

        if(snap.exists()){
          const data:any = { id:snap.id, ...snap.data() };
          setProduct(data);
        }

        setLoading(false);
      }catch(err){
        console.log(err);
        setLoading(false);
      }
    };

    fetchData();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  // ✅ SAFE VARIATIONS
  const variations = Array.isArray(product?.variations)
    ? product.variations
    : [];

  const validVariations = variations.filter(
    (v:any)=> v && v.color && v.size
  );

  // 🎨 UNIQUE COLORS
  const colors = [...new Set(validVariations.map((v:any)=>v.color))];

  // 📏 SIZES BASED ON COLOR
  const sizes = validVariations.filter(
    (v:any)=> v.color === selectedColor
  );

  // 🔥 SELECTED VARIANT
  const selectedVariant = validVariations.find(
    (v:any)=> v.color === selectedColor && v.size === selectedSize
  );

  // 🖼️ IMAGES
  const images =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : [product.image || "/no-image.png"];

  // 👉 DEFAULT SELECT
  useEffect(()=>{
    if(colors.length && !selectedColor){
      setSelectedColor(colors[0]);
    }
  },[colors]);

  useEffect(()=>{
    if(sizes.length && !selectedSize){
      setSelectedSize(sizes[0].size);
    }
  },[sizes]);

  // 👉 SWIPE
  const handleSwipe = (e:any)=>{
    const startX = e.touches[0].clientX;

    const end = (ev:any)=>{
      const endX = ev.changedTouches[0].clientX;

      if(startX - endX > 50){
        setActiveImage((p)=>Math.min(p+1, images.length-1));
      }

      if(endX - startX > 50){
        setActiveImage((p)=>Math.max(p-1, 0));
      }

      window.removeEventListener("touchend", end);
    };

    window.addEventListener("touchend", end);
  };

  return(
    <div className="min-h-screen bg-white pt-[60px]">

      {/* 🔥 IMAGE SLIDER */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleSwipe}
      >
        <div
          className="flex transition-transform duration-300"
          style={{ transform:`translateX(-${activeImage * 100}%)` }}
        >
          {images.map((img:any,i:number)=>(
            <img
              key={i}
              src={img}
              onClick={()=>setFullscreen(true)}
              onError={(e:any)=>{e.target.src="/no-image.png"}}
              className="w-full h-[350px] object-contain flex-shrink-0"
            />
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {images.map((_:any,i:number)=>(
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

        {/* 🎨 COLOR */}
        <h2 className="font-semibold">Select Color</h2>

        <div className="flex gap-3 mt-2">
          {colors.map((c:any,i:number)=>(
            <div
              key={i}
              onClick={()=>setSelectedColor(c)}
              className={`w-10 h-10 rounded-full border-2 cursor-pointer ${
                selectedColor===c ? "border-black scale-110" : "border-gray-300"
              }`}
              style={{ background:c }}
            />
          ))}
        </div>

        {/* 📏 SIZE */}
        <h2 className="font-semibold mt-4">Select Size</h2>

        <div className="flex gap-2 mt-2 flex-wrap">
          {sizes.map((s:any,i:number)=>(
            <div
              key={i}
              onClick={()=> s.stock > 0 && setSelectedSize(s.size)}
              className={`px-4 py-2 border rounded cursor-pointer ${
                selectedSize===s.size
                  ? "bg-black text-white"
                  : "bg-white"
              } ${s.stock===0 ? "opacity-50 line-through" : ""}`}
            >
              {s.size}
            </div>
          ))}
        </div>

        {/* 💰 PRICE */}
        <div className="mt-4 text-2xl font-bold">
          ₹{selectedVariant?.price || product.sellPrice}
        </div>

        {/* 🛒 BUTTON */}
        <button
          disabled={!selectedVariant || selectedVariant.stock===0}
          onClick={()=>router.push(`/checkout?productId=${product.id}`)}
          className="w-full bg-green-500 text-white py-3 rounded mt-6"
        >
          Buy Now
        </button>

      </div>

      {/* 🔥 FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img
            src={images[activeImage]}
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
