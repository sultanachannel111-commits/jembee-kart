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

        // default select
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

  // 🔥 SIZE FILTER
  const sizes = product?.variations?.filter(
    (v:any)=> v.images?.[0] === selectedVariant?.images?.[0]
  );

  return (
    <div className="p-4">

      {/* 🔥 MAIN IMAGE */}
      <img
        src={selectedVariant?.images?.[0] || "/no-image.png"}
        className="w-full h-[320px] object-contain bg-white"
      />

      {/* 🔥 IMAGE SELECTOR */}
      <div className="flex gap-3 mt-3 overflow-x-auto">
        {imageVariants.map((v:any,i:number)=>(
          <div
            key={i}
            onClick={()=>{
              setSelectedVariant(v);
              setSelectedSize(v.size);
            }}
            className={`p-[3px] rounded-lg border-2 ${
              selectedVariant?.images?.[0] === v.images?.[0]
                ? "border-black"
                : "border-gray-300"
            }`}
          >
            <img
              src={v.images?.[0]}
              className="w-16 h-16 object-cover rounded"
            />
          </div>
        ))}
      </div>

      {/* 🔥 NAME */}
      <h1 className="text-xl font-bold mt-4">
        {product.name}
      </h1>

      {/* 🔥 PRICE */}
      <h2 className="text-2xl font-bold mt-2">
        ₹{selectedVariant?.price}
      </h2>

      {/* 🔥 STOCK */}
      <p className="text-green-600 mt-1">
        {selectedVariant?.stock > 0
          ? `In Stock (${selectedVariant.stock})`
          : "Out of Stock"}
      </p>

      {/* 🔥 SIZE */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Size</h3>

        <div className="flex gap-3 flex-wrap">

          {sizes.map((v:any,i:number)=>(
            <div
              key={i}
              onClick={()=>{
                if(v.stock > 0){
                  setSelectedSize(v.size);
                  setSelectedVariant(v);
                }
              }}
              className={`px-4 py-2 border rounded text-center ${
                selectedSize === v.size
                  ? "border-black"
                  : "border-gray-300"
              } ${
                v.stock === 0
                  ? "opacity-40 line-through cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div>{v.size}</div>
              <div className="text-xs text-gray-500">
                ₹{v.price}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 🔥 BUY BUTTON */}
      <button
        disabled={selectedVariant?.stock === 0}
        className="w-full bg-black text-white py-3 rounded mt-6"
      >
        Buy Now
      </button>

    </div>
  );
}
