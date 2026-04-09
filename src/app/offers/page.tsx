"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function OffersPage(){

  const [offers,setOffers] = useState<any[]>([]);
  const [products,setProducts] = useState<any>({});

  const router = useRouter();

  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{

    // 🔥 OFFERS LOAD
    const offerSnap = await getDocs(collection(db,"offers"));
    const offerList = offerSnap.docs.map(d=>({
      id:d.id,
      ...d.data()
    }));

    setOffers(offerList);

    // 🔥 PRODUCTS LOAD
    const productSnap = await getDocs(collection(db,"products"));

    const map:any = {};
    productSnap.forEach(d=>{
      map[d.id] = d.data();
    });

    setProducts(map);
  };

  return(
    <div className="p-4 min-h-screen bg-gray-50">

      {/* 🔥 TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        🔥 Today Offers
      </h1>

      {/* 🔥 GRID */}
      <div className="grid grid-cols-2 gap-4">

        {offers.map((o:any)=>{

          const product = products[o.productId];

          if(!product) return null;

          return(

            <div
              key={o.id}
              onClick={()=>router.push(`/product/${o.productId}`)}
              className="bg-white rounded-xl shadow p-3 cursor-pointer hover:scale-105 transition"
            >

              {/* 🖼 IMAGE */}
              <img
                src={product.image || "/no-image.png"}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg"
              />

              {/* 🏷 NAME */}
              <p className="font-semibold text-sm mt-2 line-clamp-2">
                {product.name}
              </p>

              {/* 🔥 DISCOUNT BADGE */}
              <div className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded w-fit">
                {o.discount}% OFF
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}
