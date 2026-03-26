"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {

  const [orders,setOrders] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [tab,setTab] = useState("All");

  /* ========================
     REALTIME FETCH (🔥 IMPORTANT)
  ========================= */
  useEffect(()=>{

    const q = query(
      collection(db,"orders"),
      orderBy("createdAt","desc")
    );

    const unsub = onSnapshot(q,(snapshot)=>{
      const data = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      setOrders(data);
      setLoading(false);
    });

    return ()=>unsub();

  },[]);

  /* ========================
     SEND TO QIKINK
  ========================= */
  const sendToQikink = async(orderId:string)=>{

    try{

      const res = await fetch("/api/qikink/send-order",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({orderId})
      });

      const data = await res.json();

      if(data.success){

        await updateDoc(doc(db,"orders",orderId),{
          status:"Processing",
          updatedAt:new Date()
        });

        toast.success("Sent to Qikink 🚀");

      }else{
        toast.error("Failed to send order");
      }

    }catch{
      toast.error("Server error");
    }
  };

  /* ========================
     STATUS FUNCTIONS
  ========================= */

  const markShipped = async(orderId:string)=>{

    await updateDoc(doc(db,"orders",orderId),{
      status:"Shipped",
      updatedAt:new Date(),
      location:{
        lat:28.6139,
        lng:77.2090
      }
    });

    toast.success("Order Shipped 🚚");
  };

  const markOutForDelivery = async(orderId:string)=>{

    await updateDoc(doc(db,"orders",orderId),{
      status:"Out for Delivery",
      updatedAt:new Date(),
      location:{
        lat:28.5355,
        lng:77.3910
      }
    });

    toast.success("Out for Delivery 🛵");
  };

  const markDelivered = async(orderId:string)=>{

    await updateDoc(doc(db,"orders",orderId),{
      status:"Delivered",
      updatedAt:new Date(),
      location:{
        lat:28.7041,
        lng:77.1025
      }
    });

    toast.success("Delivered 🎉");
  };

  /* ========================
     FILTER
  ========================= */

  let filteredOrders = orders;

  if(tab !== "All"){
    filteredOrders = filteredOrders.filter(o=>o.status === tab);
  }

  filteredOrders = filteredOrders.filter(o=>
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  /* ========================
     LOADING
  ========================= */

  if(loading){
    return(
      <div className="min-h-screen flex items-center justify-center">
        Loading Orders...
      </div>
    );
  }

  /* ========================
     UI
  ========================= */

  return(
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-3xl font-bold text-purple-600 mb-6">
        Orders Management
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search Order ID..."
        className="border p-3 rounded-lg w-full mb-6"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      {/* TABS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["All","Pending","Processing","Shipped","Out for Delivery","Delivered"].map(t=>(
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-lg ${
              tab===t
                ? "bg-purple-600 text-white"
                : "bg-white border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      <div className="space-y-6">

        {filteredOrders.map(order=>{

          const date =
            order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString()
              : "No date";

          return(

            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl shadow-md"
            >

              <h2 className="text-lg font-bold">
                {order.id}
              </h2>

              <p className="text-gray-400 text-sm">
                {date}
              </p>

              <p className="mt-2 font-semibold">
                {order.product?.name || "Product"}
              </p>

              <p className="text-green-600 font-bold">
                ₹{order.total || order.amount || order.price || 0}
              </p>

              {/* CUSTOMER */}
              <div className="mt-3 text-sm">
                <p>{order.customer?.firstName} {order.customer?.lastName}</p>
                <p>{order.customer?.phone}</p>
                <p>{order.customer?.city}</p>
              </div>

              {/* STATUS */}
              <div className="mt-3">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                  {order.status || "Pending"}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="mt-4 flex gap-3 flex-wrap">

                <button
                  onClick={()=>sendToQikink(order.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  Send Qikink
                </button>

                <button
                  onClick={()=>markShipped(order.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Shipped
                </button>

                <button
                  onClick={()=>markOutForDelivery(order.id)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                >
                  Out for Delivery
                </button>

                <button
                  onClick={()=>markDelivered(order.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Delivered
                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}
