"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {

  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order_id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Verifying payment...");
  const [finalOrderId, setFinalOrderId] = useState("");

  const [debug, setDebug] = useState("");

  useEffect(() => {

    const verifyAndSave = async () => {

      try {

        const stored = localStorage.getItem("orderData");

        if (!stored) {
          setStatus("❌ No order data found");
          setLoading(false);
          return;
        }

        const orderData = JSON.parse(stored);

        console.log("🧾 ORDER DATA:", orderData);

        // =========================
        // 🔍 VERIFY PAYMENT
        // =========================

        const verifyRes = await fetch("/api/cashfree/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orderId,
            orderData
          })
        });

        const verifyData = await verifyRes.json();

        console.log("🔍 VERIFY:", verifyData);

        setDebug(JSON.stringify(verifyData, null, 2));

        if (!verifyData.success) {
          setStatus("❌ Payment verification failed");
          setLoading(false);
          return;
        }

        // =========================
        // ✅ SUCCESS
        // =========================

        setStatus("✅ Payment Successful");
        setFinalOrderId(verifyData.orderId);

        // 🔥 clear temp data
        localStorage.removeItem("orderData");

      } catch (err: any) {
        console.log("❌ ERROR:", err);
        setStatus("Payment error ❌");
        setDebug(err.message);
      }

      setLoading(false);
    };

    verifyAndSave();

  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-white p-4">

      <div className="backdrop-blur-xl bg-white/70 border border-white/50 p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">

        <div className="text-5xl mb-3">
          {loading ? "⏳" : "🎉"}
        </div>

        <h1 className="text-xl font-bold text-green-600 mb-2">
          {status}
        </h1>

        {!loading && (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Order ID: {finalOrderId || orderId}
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-black text-white py-3 rounded-xl mb-2"
            >
              Go to Home
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="w-full border py-3 rounded-xl"
            >
              View Orders
            </button>
          </>
        )}

        {/* DEBUG */}
        <div className="mt-4 text-xs text-left bg-black/80 text-white p-2 rounded max-h-40 overflow-auto">
          {debug}
        </div>

      </div>

    </div>
  );
}
