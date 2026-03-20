"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {

  const params = useParams();
  const id = params?.id as string;

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);

  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);

  // 🔥 FETCH
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        // default select
        if(data?.variations?.length){
          setSelectedColor(0);
          setSelectedSize(data.variations[0].sizes[0]);
        }
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const currentVariant = product.variations?.[selectedColor];
  const sizes = currentVariant?.sizes || [];

  const price = selectedSize?.price || 0;
  const stock = selectedSize?.stock || 0;

  return (
    <div className="p-4">

      {/* 🔥 MAIN IMAGE */}
      <div className="bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={currentVariant?.image || product.image || "/no-image.png"}
          className="w-full h-[320px] object-contain"
        />
      </div>

      {/* 🔥 IMAGE SELECTOR (COLOR) */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {product.variations.map((v:any,i:number)=>(
          <img
            key={i}
            src={v.image}
            onClick={()=>{
              setSelectedColor(i);
              setSelectedSize(v.sizes[0]); // reset size
            }}
            className={`w-16 h-16 rounded-xl border cursor-pointer ${
              selectedColor===i
                ? "border-black scale-105"
                : "border-gray-300"
            }`}
          />
        ))}
      </div>

      {/* NAME */}
      <h1 className="text-xl font-bold mt-4">
        {product.name}
      </h1>

      {/* PRICE */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-bold">
          ₹{price}
        </span>
        <span className="text-green-600 text-sm font-semibold">
          Best Price
        </span>
      </div>

      {/* STOCK */}
      <p className={`mt-1 font-medium ${
        stock > 0 ? "text-green-600" : "text-red-500"
      }`}>
        {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
      </p>

      {/* 🔥 SIZE */}
      <div className="mt-5">
        <h3 className="font-semibold mb-3">Select Size</h3>

        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s:any,i:number)=>(
            <div
              key={i}
              onClick={()=>{
                if(s.stock > 0){
                  setSelectedSize(s);
                }
              }}
              className={`rounded-xl p-3 border text-center transition ${
                selectedSize?.size === s.size
                  ? "bg-black text-white border-black scale-105"
                  : "bg-white border-gray-300"
              } ${
                s.stock === 0
                  ? "opacity-40 line-through cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div className="font-semibold text-lg">
                {s.size}
              </div>

              <div className="text-sm mt-1">
                ₹{s.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BUY BUTTON */}
      <button
        disabled={!selectedSize || stock === 0}
        className="w-full bg-black text-white py-3 rounded-xl mt-6 text-lg font-semibold"
      >
        Buy Now
      </button>

    </div>
  );
}
