"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminOrdersPage() {

  const [orders,setOrders] = useState<any[]>([]);

  /* ========================
     FETCH ORDERS
  ======================== */

  const fetchOrders = async ()=>{

    const snap = await getDocs(
      collection(db,"orders")
    );

    const list = snap.docs.map((d)=>({

      id:d.id,
      ...d.data()

    }));

    setOrders(list);

  };

  useEffect(()=>{

    fetchOrders();

  },[]);


  /* ========================
     UPDATE STATUS
  ======================== */

  const updateStatus = async (
    id:string,
    status:string
  )=>{

    await updateDoc(
      doc(db,"orders",id),
      { status }
    );

    fetchOrders();

  };


  /* ========================
     UI
  ======================== */

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-purple-600">
          Orders Management
        </h1>

        <p className="text-gray-500 text-sm">
          Track and manage customer orders
        </p>

      </div>


      {/* ORDERS GRID */}

      <div className="grid md:grid-cols-2 gap-6">

        {orders.map((order:any)=>(

          <div
            key={order.id}
            className="bg-white shadow rounded-xl p-5 space-y-3"
          >

            {/* ORDER ID */}

            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <h2 className="font-semibold">
              {order.id}
            </h2>


            {/* CUSTOMER */}

            {order.customer?.firstName && (

              <div>

                <p className="text-sm text-gray-500">
                  Customer
                </p>

                <p>
                  {order.customer.firstName}
                </p>

              </div>

            )}


            {/* PRODUCT */}

            {order.product?.name && (

              <div>

                <p className="text-sm text-gray-500">
                  Product
                </p>

                <p>
                  {order.product.name}
                </p>

              </div>

            )}


            {/* STATUS */}

            <div>

              <p className="text-sm text-gray-500">
                Status
              </p>

              <span
                className={`text-xs px-3 py-1 rounded ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Shipped"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status || "Pending"}
              </span>

            </div>


            {/* ACTION BUTTONS */}

            <div className="flex gap-3 pt-3">

              <button
                onClick={()=>
                  updateStatus(order.id,"Shipped")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Mark Shipped
              </button>

              <button
                onClick={()=>
                  updateStatus(order.id,"Delivered")
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Mark Delivered
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
