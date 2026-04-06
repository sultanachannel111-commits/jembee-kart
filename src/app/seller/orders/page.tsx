"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function SellerOrders(){

  const [orders,setOrders] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  // ================= LOAD ORDERS =================
  const loadOrders = async()=>{

    const user = auth.currentUser;
    if(!user) return;

    try{

      const q = query(
        collection(db,"orders"),
        where("sellerRef","==",user.uid)
      );

      const snap = await getDocs(q);

      let list:any = [];

      snap.forEach((d)=>{

        const data:any = d.data();

        list.push({
          id:d.id,
          ...data
        });

      });

      setOrders(list);

    }catch(err){
      console.log("Order Load Error:",err);
    }

    setLoading(false);
  };

  useEffect(()=>{
    loadOrders();
  },[]);

  // ================= UPDATE STATUS =================
  const updateStatus = async(id:string,status:string)=>{

    try{

      await updateDoc(
        doc(db,"orders",id),
        {
          status:status,

          ...(status === "DELIVERED" && {
            orderStatus:"DELIVERED",
            paymentStatus:"SUCCESS"
          })
        }
      );

      loadOrders();

    }catch(err){
      console.log("Status Update Error:",err);
    }
  };

  // ================= LOADING =================
  if(loading){
    return(
      <div className="p-6 text-center">
        Loading orders...
      </div>
    );
  }

  // ================= EMPTY =================
  if(orders.length === 0){
    return(
      <div className="p-6 text-center">
        No orders found ❌
      </div>
    );
  }

  // ================= UI =================
  return(

    <div className="min-h-screen p-4 bg-gray-50">

      <h1 className="text-2xl font-bold mb-6">
        Seller Orders 📦
      </h1>

      <div className="space-y-4">

        {orders.map((o:any)=>{

          // 🔥 FIX STATUS
          const status = o.orderStatus || o.status || "PENDING";

          return(

            <div
              key={o.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >

              {/* LEFT */}
              <div>

                <h2 className="font-bold">
                  {o.productName || "Product"}
                </h2>

                <p className="text-gray-500 text-sm">
                  Customer: {o.address?.name || o.customerName || "N/A"}
                </p>

                <p className="text-gray-500 text-sm">
                  Price: ₹{o.total || o.price || 0}
                </p>

                {/* 🔥 NEW: COMMISSION */}
                <p className="text-green-600 text-sm font-semibold">
                  Commission: ₹{o.commission || 0}
                </p>

                {/* 🔥 NEW: EARNING STATUS */}
                <p className={`text-sm ${
                  status === "DELIVERED"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}>
                  Earning: {status === "DELIVERED" ? "Available 💸" : "Pending ⏳"}
                </p>

                <p className="text-sm text-gray-400">
                  Status: {status}
                </p>

              </div>

              {/* RIGHT BUTTONS */}
              <div className="space-x-2">

                <button
                  onClick={()=>updateStatus(o.id,"Shipped")}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Ship
                </button>

                <button
                  onClick={()=>updateStatus(o.id,"DELIVERED")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Deliver
                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}
