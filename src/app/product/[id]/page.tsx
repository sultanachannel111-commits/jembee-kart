"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [user,setUser] = useState<any>(null);

  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);

  // AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
    return ()=>unsub();
  },[]);

  // FETCH
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Not found</div>;

  const variant = product?.variations?.[selectedColor] || {};

  const image = variant?.images?.main;

  // 🔥 FINAL PRICE FIX
  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    Number(variant?.sellPrice) ||
    Number(product?.price) ||
    0;

  const stock = Number(selectedSize?.stock) || 0;

  // 🛒 ADD
  const handleAddToCart = async () => {

    if (!user) return router.push("/login");
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      image,
      size: selectedSize.size,
      price: price,
      sellPrice: price,
      quantity: 1
    });

    alert("Added to cart");
  };

  // 🔥 SHARE
  const handleShare = () => {
    navigator.share?.({
      title: product.name,
      text: "Check this product",
      url: window.location.href
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white pb-24">

      {/* IMAGE */}
      <div className="relative">
        <img src={image} className="w-full h-[320px] object-contain"/>

        {/* SHARE BUTTON */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full shadow"
        >
          🔗
        </button>
      </div>

      <div className="p-4">

        {/* NAME */}
        <h1 className="text-xl font-bold">{product.name}</h1>

        {/* PRICE */}
        <div className="mt-2">
          <span className="text-3xl font-bold text-green-600">₹{price}</span>
          <span className="text-sm text-gray-500 ml-2">Best Price</span>
        </div>

        {/* STOCK */}
        <p className={`mt-1 ${stock>0 ? "text-green-600" : "text-red-500"}`}>
          {stock>0 ? `In Stock (${stock})` : "Out of Stock"}
        </p>

        {/* SIZE */}
        <div className="mt-5">
          <h3 className="font-semibold mb-3">Select Size</h3>

          <div className="grid grid-cols-3 gap-3">

            {variant?.sizes?.map((s:any,i:number)=>(
              <div
                key={i}
                onClick={()=>s.stock>0 && setSelectedSize(s)}
                className={`p-3 rounded-xl border text-center transition ${
                  selectedSize?.size===s.size
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                } ${
                  s.stock===0
                    ? "opacity-40 line-through"
                    : "cursor-pointer"
                }`}
              >
                {/* SIZE */}
                <div className="font-semibold">{s.size}</div>

                {/* PRICE */}
                <div className="text-sm mt-1">
                  ₹{s.sellPrice || s.price || 0}
                </div>

                {/* DESCRIPTION */}
                <div className="text-[10px] text-gray-500 mt-1">
                  Premium Quality
                </div>

              </div>
            ))}

          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6 text-gray-600 text-sm">
          {product.description || "High quality premium product"}
        </div>

      </div>

      {/* BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white border-t flex gap-3">

        <button
          onClick={handleAddToCart}
          className="w-1/2 py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold"
        >
          Add to Cart
        </button>

        <button
          className="w-1/2 py-3 rounded-xl bg-blue-600 text-white font-semibold"
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}
