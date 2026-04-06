"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function SellerOrders() {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD ORDERS
  const loadOrders = async () => {

    const user = auth.currentUser;
    if (!user) return;

    try {

      const q = query(
        collection(db, "orders"),
        where("sellerRef", "==", user.uid)
      );

      const snap = await getDocs(q);

      let list: any[] = [];

      snap.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setOrders(list);

    } catch (err) {
      console.log("Order Load Error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 🔥 UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {

    try {

      await updateDoc(doc(db, "orders", id), {
        status: status,

        ...(status === "DELIVERED" && {
          orderStatus: "DELIVERED",
          paymentStatus: "SUCCESS"
        })
      });

      loadOrders();

    } catch (err) {
      console.log("Status Update Error:", err);
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading orders...
      </div>
    );
  }

  // ❌ EMPTY
  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        No orders found ❌
      </div>
    );
  }

  // 🎯 UI
  return (

    <div className="min-h-screen p-4 bg-gray-50">

      <h1 className="text-2xl font-bold mb-6">
        Seller Orders 📦
      </h1>

      <div className="space-y-4">

        {orders.map((o: any) => {

          // 🔥 PRODUCT DATA
          const item = o.items?.[0] || {};

          const image =
            item?.image ||
            item?.images?.main ||
            "/no-image.png";

          const name =
            item?.name ||
            o.productName ||
            "Product";

          const total = Number(o.total) || 0;
          const commission = Number(o.commission) || 0;

          const status = (o.orderStatus || o.status || "PENDING").toUpperCase();

          return (

            <div
              key={o.id}
              className="bg-white p-4 rounded-xl shadow flex gap-4 items-center"
            >

              {/* 🖼 PRODUCT IMAGE */}
              <div className="w-20 h-20 relative rounded overflow-hidden border">
                <Image
                  src={image}
                  alt="product"
                  fill
                  className="object-cover"
                />
              </div>

              {/* 📦 DETAILS */}
              <div className="flex-1">

                <h2 className="font-bold text-lg">
                  {name}
                </h2>

                <p className="text-sm text-gray-500">
                  Customer: {o.address?.name || "N/A"}
                </p>

                <p className="text-sm">
                  Price: ₹{total}
                </p>

                <p className="text-sm text-green-600 font-semibold">
                  Commission: ₹{commission}
                </p>

                {/* 💰 EARNING STATUS */}
                <p
                  className={`text-sm font-medium ${
                    status === "DELIVERED"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {status === "DELIVERED"
                    ? "Earning: Available 💸"
                    : "Earning: Pending ⏳"}
                </p>

                {/* 📌 STATUS */}
                <p className="text-xs text-gray-400">
                  Status: {status}
                </p>

              </div>

              {/* ⚡ ACTIONS */}
              <div className="flex flex-col gap-2">

                {status !== "DELIVERED" ? (
                  <>
                    <button
                      onClick={() => updateStatus(o.id, "Shipped")}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Ship
                    </button>

                    <button
                      onClick={() => updateStatus(o.id, "DELIVERED")}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Deliver
                    </button>
                  </>
                ) : (
                  <span className="text-green-600 font-semibold text-sm">
                    Delivered ✅
                  </span>
                )}

              </div>

            </div>

          );
        })}

      </div>

    </div>

  );
}
