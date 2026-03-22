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
  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);
  const [user,setUser] = useState<any>(null);

  useEffect(()=>{
    onAuthStateChanged(auth,(u)=>setUser(u));
  },[]);

  useEffect(()=>{
    const load = async()=>{
      const snap = await getDoc(doc(db,"products",id));
      if(snap.exists()){
        const data:any = {id:snap.id,...snap.data()};
        setProduct(data);
        setSelectedSize(data.variations?.[0]?.sizes?.[0]);
      }
    };
    if(id) load();
  },[id]);

  if(!product) return <div className="p-5">Loading...</div>;

  const variant = product.variations[selectedColor];
  const image = variant?.images?.main;

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    0;

  // 🛒 ADD
  const addToCart = async()=>{
    if(!user) return router.push("/login");
    if(!selectedSize) return alert("Select size");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      name:product.name,
      productId:product.id,
      image,
      size:selectedSize.size,
      price,
      sellPrice:price,
      quantity:1
    });

    alert("Added to cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 pb-24">

      {/* IMAGE */}
      <div className="p-4">
        <div className="rounded-3xl overflow-hidden shadow-xl bg-white/60 backdrop-blur-xl">
          <img src={image} className="w-full h-[300px] object-contain"/>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 space-y-4">

        {/* GLASS CARD */}
        <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/30">

          <h1 className="text-xl font-bold">
            {product.name}
          </h1>

          <p className="text-3xl font-bold mt-2 text-black">
            ₹{price}
          </p>

        </div>

        {/* SIZE */}
        <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/30">

          <p className="font-semibold mb-3">Select Size</p>

          <div className="grid grid-cols-3 gap-3">
            {variant.sizes.map((s:any,i:number)=>(
              <div
                key={i}
                onClick={()=>setSelectedSize(s)}
                className={`p-3 text-center rounded-xl border transition ${
                  selectedSize?.size===s.size
                    ? "bg-black text-white scale-105"
                    : "bg-white/50"
                }`}
              >
                <p>{s.size}</p>
                <p className="text-sm">₹{s.sellPrice || s.price}</p>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 🔥 STICKY BAR */}
      <div className="fixed bottom-0 left-0 w-full p-3 backdrop-blur-xl bg-white/70 border-t flex gap-3">

        <button
          onClick={addToCart}
          className="w-1/2 py-3 rounded-xl border border-black font-medium hover:scale-105 transition"
        >
          Add to Cart
        </button>

        <button
          className="w-1/2 py-3 rounded-xl bg-black text-white font-medium hover:scale-105 transition"
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}
