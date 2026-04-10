"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function OffersPage(){

  const [offers,setOffers] = useState<any[]>([]);
  const [products,setProducts] = useState<any>({});
  const [loading,setLoading] = useState(true);

  const router = useRouter();

  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{

    const offerSnap = await getDocs(collection(db,"offers"));
    const offerList = offerSnap.docs.map(d=>({
      id:d.id,
      ...d.data()
    }));

    const productSnap = await getDocs(collection(db,"products"));

    const map:any = {};
    productSnap.forEach(d=>{
      map[d.id] = d.data();
    });

    setOffers(offerList);
    setProducts(map);

    setLoading(false);
  };

  return(

    <div className="min-h-screen p-4 pb-20 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">

      {/* 🔥 TITLE */}
      <h1 className="text-3xl font-bold text-white mb-6">
        🔥 Premium Offers
      </h1>

      {/* ================= SHIMMER ================= */}
      {loading && (
        <div className="flex gap-4 overflow-x-auto">
          {[1,2,3].map(i=>(
            <div key={i} className="min-w-[220px] h-[260px] bg-white/10 rounded-2xl animate-pulse"/>
          ))}
        </div>
      )}

      {/* ================= CAROUSEL ================= */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">

        {offers.map((o:any)=>{

          const product = products[o.productId];
          if(!product) return null;

          return(
            <OfferCard
              key={o.id}
              product={product}
              offer={o}
              router={router}
            />
          );
        })}

      </div>

    </div>
  );
}


/* ================= CARD ================= */

function OfferCard({ product, offer, router }:any){

  const [timeLeft,setTimeLeft] = useState("");

  useEffect(()=>{

    const interval = setInterval(()=>{

      if(!offer.endDate){
        setTimeLeft("");
        return;
      }

      const end = new Date(offer.endDate).getTime();
      const now = Date.now();

      const diff = end - now;

      if(diff <= 0){
        setTimeLeft("Expired");
        return;
      }

      const h = Math.floor(diff / (1000*60*60));
      const m = Math.floor((diff % (1000*60*60))/(1000*60));
      const s = Math.floor((diff % (1000*60))/1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);

    },1000);

    return ()=>clearInterval(interval);

  },[offer]);

  return(

    <div
      onClick={()=>router.push(`/product/${offer.productId}`)}
      className="min-w-[220px] snap-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 shadow-xl cursor-pointer hover:scale-105 transition"
    >

      {/* IMAGE */}
      <div className="relative">

        <img
          src={product.image || "/no-image.png"}
          className="w-full h-36 object-cover rounded-xl"
        />

        {/* DISCOUNT */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
          {offer.discount}% OFF
        </div>

      </div>

      {/* NAME */}
      <p className="text-white text-sm font-semibold mt-2 line-clamp-2">
        {product.name}
      </p>

      {/* TIMER */}
      {timeLeft && (
        <p className="text-xs text-yellow-400 mt-1">
          ⏳ {timeLeft}
        </p>
      )}

      {/* BUTTON */}
      <button
        onClick={(e)=>{
          e.stopPropagation();
          router.push(`/product/${offer.productId}`);
        }}
        className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm py-2 rounded-xl shadow-lg"
      >
        Shop Now 🚀
      </button>

    </div>
  );
} Agar isme problem hai to Sahi karke poora code likho background white 
