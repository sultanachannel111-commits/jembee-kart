"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  /* =========================
     FETCH ORDER
  ========================= */
  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", id as string));

      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };

        let total = 0;
        data.items?.forEach((item: any) => {
          total += Number(item.price) * Number(item.quantity);
        });

        setOrder({ ...data, total });
      }
    };

    fetchOrder();
  }, [id]);

  /* =========================
     TRACKING STEPS
  ========================= */
  const steps = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  /* =========================
     FAKE LIVE TRACKING
  ========================= */
  useEffect(() => {
    if (!order) return;

    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex++;

      if (stepIndex >= steps.length) {
        clearInterval(interval);
        return;
      }

      setCurrentStep(stepIndex);
      setProgress((stepIndex / (steps.length - 1)) * 100);

      // 🔔 Notification
      toast.success(`Order ${steps[stepIndex]} 🚚`);

    }, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, [order]);

  if (!order) return <p className="p-4">Loading...</p>;

  /* =========================
     WHATSAPP
  ========================= */
  const whatsappLink = `https://wa.me/917061369212?text=${encodeURIComponent(
    `Order Update Needed\nOrder ID: ${order.id}`
  )}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-5">

        {/* 🔔 NOTIFICATION BELL */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Order Details</h1>

          <button
            onClick={() => toast.success("No new notifications 🔔")}
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
            <div
              key={i}
              className="flex justify-between bg-gray-50 p-2 rounded-lg"
            >
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>

        {/* =========================
           TRACKING BAR + TRUCK
        ========================= */}
        <div className="mt-8">

          <div className="relative">

            {/* LINE */}
            <div className="w-full h-2 bg-gray-300 rounded-full" />

            {/* PROGRESS */}
            <div
              className="h-2 bg-green-500 rounded-full absolute top-0"
              style={{ width: `${progress}%` }}
            />

            {/* 🚚 TRUCK */}
            <div
              className="absolute -top-4 text-2xl transition-all duration-500"
              style={{ left: `${progress}%` }}
            >
              🚚
            </div>

          </div>

          {/* STEPS */}
          <div className="flex justify-between mt-4 text-xs">
            {steps.map((step, i) => (
              <span
                key={i}
                className={
                  i <= currentStep ? "text-green-600 font-bold" : "text-gray-400"
                }
              >
                {step}
              </span>
            ))}
          </div>

        </div>

        {/* =========================
           LIVE MAP
        ========================= */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">📍 Live Location</h3>

          <iframe
            className="w-full h-52 rounded-xl border"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBj29BLR64WHyFPRTWszEHGkyrMMTCpwkQ&q=${order.customer?.city}`}
          />
        </div>

        {/* =========================
           DELIVERY BOY ANIMATION
        ========================= */}
        <div className="mt-6 text-center">

          <div className="text-5xl animate-bounce">
            🧍‍♂️📦
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Delivery partner is on the way...
          </p>

        </div>

        {/* =========================
           WHATSAPP
        ========================= */}
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
