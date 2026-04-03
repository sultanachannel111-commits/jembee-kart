"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function StorePage(){

  const { sellerId } = useParams();
  const [products,setProducts] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  // 🔥 LOAD PRODUCTS
  useEffect(()=>{
    const load = async ()=>{

      const snap = await getDocs(collection(db,"products"));
      const arr:any = [];

      snap.forEach(d=>{
        const data = d.data();

        if(data.sellerId === sellerId){
          arr.push({ id:d.id,...data });
        }
      });

      setProducts(arr);
      setLoading(false);

      // 🔥 SAVE REF (affiliate)
      localStorage.setItem("refSeller", String(sellerId));

    };

    load();
  },[]);


  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${sellerId}`;


  return(
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4">

      {/* 🔥 HEADER */}
      <div className="glass p-5 rounded-2xl mb-5 text-center shadow-lg backdrop-blur-lg bg-white/40">

        <h1 className="text-2xl font-bold">
          🛍 Seller Store
        </h1>

        <p className="text-sm text-gray-600 mt-1">
          Best deals just for you 🔥
        </p>

      </div>


      {/* 🔥 SHARE BANNER */}
      <div className="glass p-4 rounded-2xl mb-5 shadow backdrop-blur-lg bg-gradient-to-r from-green-400/80 to-emerald-500/80 text-white">

        <h2 className="font-bold text-lg">
          🚀 Share & Earn
        </h2>

        <p className="text-sm opacity-90">
          Share this store & earn commission 💰
        </p>

        <div className="flex gap-2 mt-3">

          <input
            value={shareLink}
            readOnly
            className="flex-1 p-2 rounded text-black text-sm"
          />

          <button
            onClick={()=>{
              navigator.clipboard.writeText(shareLink);
              alert("Link copied ✅");
            }}
            className="bg-white text-black px-3 rounded"
          >
            Copy
          </button>

        </div>

        <button
          onClick={()=>{
            const text = `🛍 Shop amazing products 🔥\n\n${shareLink}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
          }}
          className="w-full mt-3 bg-white text-green-600 py-2 rounded-xl font-semibold"
        >
          📲 Share Store
        </button>

      </div>


      {/* 🔥 LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      )}


      {/* ❌ NO PRODUCTS */}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-500">
          No products found ❌
        </p>
      )}


      {/* 🔥 PRODUCTS GRID */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((p)=>(
          <div
            key={p.id}
            className="glass p-3 rounded-2xl shadow-lg backdrop-blur-lg bg-white/50"
          >

            <img
              src={p.image}
              className="h-32 w-full object-cover rounded-xl"
            />

            <p className="font-semibold mt-2 text-sm line-clamp-2">
              {p.name}
            </p>

            <p className="text-green-600 font-bold mt-1">
              ₹{p.price}
            </p>

            {/* 🔥 ACTION BUTTON */}
            <button
              onClick={()=>{
                window.location.href = `/product/${p.id}`;
              }}
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-xl text-sm"
            >
              View Product
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}
