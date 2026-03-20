"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {

  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");

  // 🔥 FETCH
  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);

        if (data?.variations?.length) {
          setSelectedVariant(data.variations[0]);
          setSelectedSize(data.variations[0].size);
        }
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found</div>;

  // 🔥 UNIQUE IMAGE VARIANTS
  const imageVariants = Object.values(
    product?.variations?.reduce((acc:any, v:any) => {
      const key = v.images?.[0];
      if (!acc[key]) acc[key] = v;
      return acc;
    }, {})
  );

  // 🔥 UNIQUE SIZES (NO DUPLICATE)
  const sizes = Object.values(
    product?.variations
      ?.filter((v:any)=> v.images?.[0] === selectedVariant?.images?.[0])
      ?.reduce((acc:any, v:any)=>{
        if(!acc[v.size]) acc[v.size] = v;
        return acc;
      }, {})
  );

  return (
    <div className="p-4">

      {/* 🔥 MAIN IMAGE */}
      <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <img
          src={selectedVariant?.images?.[0] || "/no-image.png"}
          className="w-full h-[320px] object-contain"
        />
      </div>

      {/* 🔥 IMAGE SELECTOR */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {imageVariants.map((v:any,i:number)=>(
          <div
            key={i}
            onClick={()=>{
              setSelectedVariant(v);
              setSelectedSize(v.size);
            }}
            className={`p-[3px] rounded-xl border-2 transition ${
              selectedVariant?.images?.[0] === v.images?.[0]
                ? "border-black scale-105"
                : "border-gray-300"
            }`}
          >
            <img
              src={v.images?.[0]}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* 🔥 NAME */}
      <h1 className="text-xl font-bold mt-4">
        {product.name}
      </h1>

      {/* 🔥 PREMIUM PRICE */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-bold text-black">
          ₹{selectedVariant?.price}
        </span>
        <span className="text-green-600 text-sm font-semibold">
          Best Price
        </span>
      </div>

      {/* 🔥 STOCK */}
      <p className="text-green-600 mt-1 font-medium">
        {selectedVariant?.stock > 0
          ? `In Stock (${selectedVariant.stock})`
          : "Out of Stock"}
      </p>

      {/* 🔥 SIZE PREMIUM */}
      <div className="mt-5">
        <h3 className="font-semibold mb-3 text-gray-800">
          Select Size
        </h3>

        <div className="grid grid-cols-3 gap-3">

          {sizes.map((v:any,i:number)=>(
            <div
              key={i}
              onClick={()=>{
                if(v.stock > 0){
                  setSelectedSize(v.size);
                  setSelectedVariant(v);
                }
              }}
              className={`rounded-xl p-3 border text-center transition-all ${
                selectedSize === v.size
                  ? "border-black bg-black text-white shadow-lg scale-105"
                  : "border-gray-300 bg-white"
              } ${
                v.stock === 0
                  ? "opacity-40 line-through cursor-not-allowed"
                  : "cursor-pointer hover:shadow-md"
              }`}
            >
              <div className="font-semibold text-lg">
                {v.size}
              </div>

              <div className={`text-sm mt-1 ${
                selectedSize === v.size
                  ? "text-gray-200"
                  : "text-gray-500"
              }`}>
                ₹{v.price}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 🔥 BUY BUTTON */}
      <button
        disabled={selectedVariant?.stock === 0}
        className="w-full bg-black text-white py-3 rounded-xl mt-6 text-lg font-semibold shadow-md active:scale-95 transition"
      >
        Buy Now
      </button>

    </div>
  );
}
