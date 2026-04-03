"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ShippingAdminPage() {

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [shipping, setShipping] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 500
  });

  // 🔥 LOAD DATA
  useEffect(() => {

    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "shipping"));

        if (snap.exists()) {
          const data = snap.data();

          setShipping({
            prepaid: data.prepaid || 0,
            cod: data.cod || 0,
            freeShippingAbove: data.freeShippingAbove || 0
          });
        }
      } catch (err) {
        console.log("Load Error:", err);
      }
    };

    loadData();

  }, []);

  // 💾 SAVE
  const saveShipping = async () => {

    // ❗ VALIDATION
    if (shipping.prepaid < 0 || shipping.cod < 0) {
      return alert("Negative value allowed nahi ❌");
    }

    try {
      setLoading(true);
      setSuccess("");

      await setDoc(doc(db, "config", "shipping"), {
        prepaid: Number(shipping.prepaid) || 0,
        cod: Number(shipping.cod) || 0,
        freeShippingAbove: Number(shipping.freeShippingAbove) || 0
      });

      setSuccess("Saved successfully ✅");

      // auto hide
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      alert("Save error ❌");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 LIVE PREVIEW LOGIC
  const demoAmount = 600;

  const prepaidShipping =
    demoAmount >= shipping.freeShippingAbove
      ? 0
      : shipping.prepaid;

  const codShipping =
    demoAmount >= shipping.freeShippingAbove
      ? shipping.cod // COD still charge
      : shipping.cod;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-50 p-4">

      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">

        <h1 className="text-xl font-bold mb-6 text-center">
          🚚 Shipping Settings (Admin)
        </h1>

        {/* SUCCESS */}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        {/* PREPAID */}
        <div className="mb-5">
          <label className="text-sm font-medium">
            Prepaid Shipping (₹)
          </label>

          <input
            type="number"
            value={shipping.prepaid}
            onChange={(e) =>
              setShipping({
                ...shipping,
                prepaid: Number(e.target.value)
              })
            }
            className="w-full mt-2 p-3 border rounded-xl"
          />
        </div>

        {/* COD */}
        <div className="mb-5">
          <label className="text-sm font-medium">
            COD Charge (₹)
          </label>

          <input
            type="number"
            value={shipping.cod}
            onChange={(e) =>
              setShipping({
                ...shipping,
                cod: Number(e.target.value)
              })
            }
            className="w-full mt-2 p-3 border rounded-xl"
          />
        </div>

        {/* FREE SHIPPING */}
        <div className="mb-6">
          <label className="text-sm font-medium">
            Free Shipping Above (₹)
          </label>

          <input
            type="number"
            value={shipping.freeShippingAbove}
            onChange={(e) =>
              setShipping({
                ...shipping,
                freeShippingAbove: Number(e.target.value)
              })
            }
            className="w-full mt-2 p-3 border rounded-xl"
          />
        </div>

        {/* 🔥 LIVE PREVIEW */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
          <p className="font-semibold mb-2">Live Preview (₹600 order)</p>

          <p>Prepaid Shipping: ₹{prepaidShipping}</p>
          <p>COD Shipping: ₹{codShipping}</p>
        </div>

        {/* BUTTON */}
        <button
          onClick={saveShipping}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

      </div>

    </div>
  );
}
