"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", id as string));

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p className="p-4">Loading...</p>;

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

  const currentStep = steps.indexOf(order.status || "Pending");

  /* =========================
     GOOGLE MAP LINK
  ========================= */
  const mapUrl = `https://www.google.com/maps?q=${order.customer?.city}`;

  /* =========================
     WHATSAPP MESSAGE
  ========================= */
  const whatsappMessage = `Hello, I want update for my order ${order.id}.
Tracking ID: ${order.trackingId || "Not available"}`;

  const whatsappLink = `https://wa.me/917061369212?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-5">

        {/* TITLE */}
        <h1 className="text-xl font-bold">Order Details</h1>

        {/* TOTAL */}
        <div className="mt-2 text-green-600 font-bold text-lg">
          ₹{order.total}
        </div>

        {/* =========================
           ITEMS
        ========================= */}
        <div className="mt-4">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>

        {/* =========================
           TRACKING TIMELINE
        ========================= */}
        <div className="mt-6">
          <h2 className="font-semibold mb-4">Tracking</h2>

          <div className="flex justify-between">

            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    index <= currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="text-xs mt-1">{step}</p>
              </div>
            ))}

          </div>
        </div>

        {/* =========================
           LIVE MAP
        ========================= */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">
            📍 Delivery Location
          </h3>

          <iframe
            src={`https://maps.google.com/maps?q=${order.customer?.city}&z=13&output=embed`}
            width="100%"
            height="200"
            className="rounded-xl border"
          />

          <a
            href={mapUrl}
            target="_blank"
            className="text-blue-600 text-sm underline mt-2 block"
          >
            Open in Google Maps
          </a>
        </div>

        {/* =========================
           SHIPPING INFO
        ========================= */}
        {order.trackingId && (
          <div className="mt-6 bg-gray-50 p-3 rounded-xl">
            <p className="text-sm">
              Tracking ID: {order.trackingId}
            </p>
            <p className="text-sm">
              Courier: {order.courier}
            </p>
          </div>
        )}

        {/* =========================
           WHATSAPP SUPPORT
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
