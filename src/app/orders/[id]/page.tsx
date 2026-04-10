"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const getFinalPrice = (item) => {
  return Number(item?.price || 0);
};

export default function OrderDetailsPage() {

  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(
      doc(db, "orders", String(id)),
      (snap) => {

        if (snap.exists()) {

          const data = { id: snap.id, ...snap.data() };

          let total = 0;

          data.items?.forEach((item) => {
            total += getFinalPrice(item) * (item.quantity || 1);
          });

          setOrder({ ...data, total });

          toast.success(`Order ${data.status || "Updated"} 🚚`);
        }
      }
    );

    return () => unsub();

  }, [id]);

  if (!order)
    return <div className="p-5 text-center">Loading...</div>;

  const steps = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStep = steps.indexOf(order.status || "Pending");

  const progress =
    (currentStep / (steps.length - 1)) * 100;

  const whatsappLink = `https://wa.me/917061369212?text=${encodeURIComponent(
    `Order Update\nID: ${order.id}\nStatus: ${order.status}`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 p-4">

      <div className="max-w-xl mx-auto space-y-4">

        <div className="bg-white p-5 rounded-3xl shadow flex justify-between items-center">
          <h1 className="text-xl font-bold">Order Tracking</h1>
          <button onClick={() => toast.success("🔔")} className="text-xl">🔔</button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <p className="text-gray-500 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">₹{order.total}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow space-y-3">
          <h3 className="font-semibold">Items</h3>

          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-bold text-green-600">
                ₹{getFinalPrice(item) * (item.quantity || 1)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-4">Tracking</h3>

          <div className="relative">
            <div className="w-full h-2 bg-gray-300 rounded-full" />

            <div
              className="h-2 bg-green-500 absolute top-0 rounded-full"
              style={{ width: `${progress}%` }}
            />

            <div
              className="absolute -top-5"
              style={{ left: `${progress}%` }}
            >
              🚚
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs">
            {steps.map((step, i) => (
              <span key={i} className={i <= currentStep ? "text-green-600 font-bold" : "text-gray-400"}>
                {step}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow text-center">
          <p className="font-bold">Status: {order.status}</p>
          <p className="text-sm text-gray-500">Delivery in 3-5 days 🚀</p>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          className="block text-center bg-green-500 text-white py-3 rounded-xl font-bold"
        >
          WhatsApp Support 📲
        </a>

      </div>
    </div>
  );
}
