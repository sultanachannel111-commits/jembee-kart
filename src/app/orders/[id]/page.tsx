"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  /* =========================
     REALTIME FIRESTORE LISTENER
  ========================= */
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };

        // total calculate
        let total = 0;
        data.items?.forEach((item: any) => {
          total += Number(item.price) * Number(item.quantity);
        });

        setOrder({ ...data, total });

        // 🔔 notification
        toast.success(`Order ${data.status} 🚚`);
      }
    });

    return () => unsub();
  }, [id]);

  if (!order) return <p className="p-4">Loading...</p>;

  /* =========================
     STEPS
  ========================= */
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

  /* =========================
     WHATSAPP
  ========================= */
  const whatsappLink = `https://wa.me/917061369212?text=${encodeURIComponent(
    `Order Update\nID: ${order.id}\nStatus: ${order.status}`
  )}`;

  /* =========================
     MAP LOCATION
  ========================= */
  const lat = order.location?.lat || 28.6139;
  const lng = order.location?.lng || 77.2090;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-5">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Order Details</h1>

          <button
            onClick={() => toast.success("Notifications 🔔")}
            className="text-xl"
          >
            🔔
          </button>
        </div>

        {/* PRICE */}
        <div className="mt-2 text-green-600 font-bold text-lg">
          ₹{order.total}
        </div>

        {/* ITEMS */}
        <div className="mt-4 space-y-2">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between bg-gray-50 p-2 rounded-lg">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * (item.quantity || 1)}</span>
            </div>
          ))}
        </div>

        {/* ================= TRACKING */}
        <div className="mt-8">

          <div className="relative">

            <div className="w-full h-2 bg-gray-300 rounded-full" />

            <div
              className="h-2 bg-green-500 absolute top-0 rounded-full"
              style={{ width: `${progress}%` }}
            />

            {/* 🚚 REAL TRUCK */}
            <div
              className="absolute -top-4 text-2xl transition-all duration-500"
              style={{ left: `${progress}%` }}
            >
              🚚
            </div>

          </div>

          <div className="flex justify-between mt-4 text-xs">
            {steps.map((step, i) => (
              <span
                key={i}
                className={
                  i <= currentStep
                    ? "text-green-600 font-bold"
                    : "text-gray-400"
                }
              >
                {step}
              </span>
            ))}
          </div>

        </div>

        {/* ================= LIVE MAP */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">📍 Live Location</h3>

          <iframe
            className="w-full h-52 rounded-xl border"
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBj29BLR64WHyFPRTWszEHGkyrMMTCpwkQ&center=${lat},${lng}&zoom=14`}
          />
        </div>

        {/* DELIVERY BOY */}
        <div className="mt-6 text-center">
          <div className="text-5xl animate-bounce">
            🧍‍♂️📦
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Delivery partner live tracking
          </p>
        </div>

        {/* WHATSAPP */}
        <div className="mt-6">
          <a
            href={whatsappLink}
            target="_blank"
            className="w-full block text-center bg-green-500 text-white py-3 rounded-xl font-semibold"
          >
            Chat on WhatsApp 📲
          </a>
        </div>

      </div>
    </div>
  );
}
