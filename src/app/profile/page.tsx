"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function TrackPage() {

  const { id }: any = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "orders", id));
      if (snap.exists()) setOrder(snap.data());
    };
    load();
  }, []);

  if (!order) return <p className="p-6">Loading...</p>;

  const created = order.createdAt?.toDate?.() || new Date();

  // 🔥 AUTO ROUTE (INDIA STYLE)
  const trackingData = order.tracking || [
    { status: "Order Placed", location: "Jamshedpur", date: created },
    { status: "Shipped", location: "Kolkata", date: addDays(created, 1) },
    { status: "In Transit", location: "Delhi", date: addDays(created, 2) },
    { status: "In Transit", location: "Nagpur", date: addDays(created, 3) },
    { status: "In Transit", location: "Mumbai", date: addDays(created, 4) },
    { status: "Out for Delivery", location: "Your City", date: addDays(created, 5) },
    { status: "Delivered", location: "Home", date: addDays(created, 6) },
  ];

  const currentIndex = trackingData.findIndex(t =>
    t.status.toUpperCase() === (order.status || "PENDING").toUpperCase()
  );

  const deliveryDate = addDays(created, 6);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-white">

      <div className="glass p-5 rounded-2xl">

        {/* HEADER */}
        <h1 className="text-xl font-bold mb-2">
          🚚 Live Tracking
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          Expected Delivery: <b>{deliveryDate.toDateString()}</b>
        </p>

        {/* CURRENT STATUS */}
        <div className="mb-4">
          <p className="text-green-600 font-semibold text-lg">
            {trackingData[currentIndex]?.status || "Processing"}
          </p>
          <p className="text-sm text-gray-500">
            📍 {trackingData[currentIndex]?.location}
          </p>
        </div>

        {/* PROGRESS */}
        <div className="h-2 bg-gray-300 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full transition-all duration-700"
            style={{ width: `${((currentIndex + 1) / trackingData.length) * 100}%` }}
          />
        </div>

        {/* TIMELINE */}
        <div className="mt-6">

          {trackingData.map((t: any, i: number) => {

            const active = i === currentIndex;
            const done = i < currentIndex;

            return (
              <div key={i} className="flex gap-3 mb-5">

                {/* DOT */}
                <div
                  className={`w-4 h-4 mt-1 rounded-full ${
                    active
                      ? "bg-green-600 animate-pulse"
                      : done
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />

                {/* CONTENT */}
                <div>
                  <p className={`font-semibold ${active ? "text-green-600" : ""}`}>
                    {t.status}
                  </p>

                  <p className="text-sm text-gray-500">
                    📍 {t.location}
                  </p>

                  <p className="text-xs text-gray-400">
                    {t.date.toDateString()}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

        {/* EXTRA STATUS */}
        <div className="mt-4 text-center">

          {trackingData[currentIndex]?.status === "Out for Delivery" && (
            <p className="text-green-600 font-semibold animate-pulse">
              🛵 Rider is coming to your location!
            </p>
          )}

          {trackingData[currentIndex]?.status === "Delivered" && (
            <p className="text-green-700 font-bold">
              🎉 Package Delivered Successfully
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

// 🔥 HELPER
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
