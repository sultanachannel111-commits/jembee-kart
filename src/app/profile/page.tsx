"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function TrackPage() {

  const { id }: any = useParams();

  const [order, setOrder] = useState<any>(null);

  useEffect(()=>{

    const load = async()=>{

      const snap = await getDoc(doc(db,"orders",id));

      if(snap.exists()){
        setOrder(snap.data());
      }

    };

    load();

  },[]);

  if(!order) return <p className="p-6">Loading...</p>;

  const steps = ["PENDING","PLACED","SHIPPED","OUT FOR DELIVERY","DELIVERED"];
  const current = steps.indexOf(order.status || "PENDING");

  return(

    <div className="p-4 min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-white">

      <div className="glass p-5 rounded-2xl">

        <h1 className="text-xl font-bold mb-3">Live Tracking 🚚</h1>

        {/* PROGRESS */}
        <div className="h-2 bg-gray-300 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full"
            style={{width:`${(current+1)*20}%`}}
          />
        </div>

        <div className="flex justify-between text-xs mt-2">
          {steps.map((s,i)=>(
            <span key={i} className={i<=current?"text-green-600":""}>
              {s}
            </span>
          ))}
        </div>

        {/* TIMELINE */}
        <div className="mt-5">

          {(order.tracking || []).map((t:any,i:number)=>(

            <div key={i} className="flex gap-3 mb-4">

              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>

              <div>
                <p className="font-semibold">{t.status}</p>
                <p className="text-sm text-gray-500">📍 {t.location}</p>
                <p className="text-xs text-gray-400">
                  {t.time?.toDate?.().toLocaleString()}
                </p>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
