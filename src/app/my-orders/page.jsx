"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function OrdersPage() {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [reason, setReason] = useState("");
  const [issue, setIssue] = useState("");

  const router = useRouter();

  // 🔥 LOAD ORDERS
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      const snap = await getDocs(collection(db, "orders"));

      const arr = [];

      snap.forEach(d => {
        const data = d.data();

        if (data.userId === u.uid) {
          arr.push({
            id: d.id,
            ...data
          });
        }
      });

      setOrders(arr);

    });

    return () => unsub();

  }, []);

  // 🚚 DELIVERY DATE
  const getDeliveryDate = (order) => {
    if (!order.createdAt?.toDate) return "N/A";
    const d = order.createdAt.toDate();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-purple-200 via-pink-100 to-white min-h-screen">

      <h1 className="text-2xl font-bold mb-4">
        My Orders 📦
      </h1>

      {orders.length === 0 && (
        <p>No orders found ❌</p>
      )}

      {orders.map(o => {

        // 🔥 FIXED TOTAL (MAIN BUG FIX)
        const total =
          Number(o.total) ||
          (Number(o.itemsTotal || 0) + Number(o.shipping || 0));

        return (

          <div
            key={o.id}
            className="glass p-4 rounded-2xl mb-4 shadow"
          >

            {/* 🖼 PRODUCT PREVIEW */}
            {o.items?.length > 0 && (
              <div className="flex gap-3 mb-3">

                <img
                  src={o.items[0]?.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border"
                />

                <div className="flex-1 text-sm">
                  <p className="font-semibold line-clamp-1">
                    {o.items[0]?.name}
                  </p>

                  <p className="text-gray-500">
                    Qty: {o.items[0]?.qty}
                  </p>

                  {o.items.length > 1 && (
                    <p className="text-xs text-gray-400">
                      +{o.items.length - 1} more item(s)
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* ORDER ID */}
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-bold break-all">{o.id}</p>

            {/* 💰 TOTAL */}
            <p className="mt-2 text-lg font-bold text-green-600">
              ₹{total}
            </p>

            {/* STATUS */}
            <p className="text-yellow-600 font-semibold">
              {o.status || "Pending"}
            </p>

            {/* 🚚 DELIVERY */}
            <p className="text-xs mt-1">
              🚚 Delivery by: {getDeliveryDate(o)}
            </p>

            {/* 🔥 PRICE BREAKDOWN */}
            <div className="text-xs mt-2 text-gray-600 space-y-1">

              <div className="flex justify-between">
                <span>Items</span>
                <span>₹{Number(o.itemsTotal || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{Number(o.shipping || 0)}</span>
              </div>

              {Number(o.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{Number(o.discount)}</span>
                </div>
              )}

            </div>

            {/* 🔥 BUTTONS */}
            <div className="flex justify-between mt-3">

              <button
                onClick={() => router.push(`/track/${o.id}`)}
                className="text-blue-600 font-medium"
              >
                Track Order
              </button>

              <button
                onClick={() => {
                  setSelectedOrder(o);
                  setShowHelp(true);
                }}
                className="border px-4 py-1 rounded-full"
              >
                Help
              </button>

            </div>

          </div>

        );

      })}

      {/* 🔥 HELP MODAL */}
      {showHelp && selectedOrder && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="glass p-5 w-[90%] max-w-md">

            <h2 className="font-bold text-lg mb-3">
              Help - Order
            </h2>

            {/* ❌ CANCEL */}
            <button
              onClick={async () => {

                // COD → always allowed
                if (selectedOrder.paymentMethod === "COD") {

                  await updateDoc(doc(db, "orders", selectedOrder.id), {
                    status: "Cancelled"
                  });

                  alert("Order cancelled ✅");
                  setShowHelp(false);
                  return;
                }

                // ONLINE RULE
                if (
                  selectedOrder.paymentMethod === "ONLINE" &&
                  selectedOrder.status !== "Pending"
                ) {
                  return alert("Prepaid order shipped hone ke baad cancel nahi hoga ❌");
                }

                await updateDoc(doc(db, "orders", selectedOrder.id), {
                  status: "Cancelled"
                });

                alert("Order cancelled ✅");
                setShowHelp(false);

              }}
              className="w-full bg-red-500 text-white p-2 rounded mb-3"
            >
              Cancel Order ❌
            </button>

            {/* 🔁 RETURN */}
            <h3 className="font-semibold mb-2">
              Return Reason
            </h3>

            <select
              className="w-full border p-2 rounded mb-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option>Wrong Product</option>
              <option>Damaged Product</option>
              <option>Size Issue</option>
              <option>Quality Issue</option>
              <option>Other</option>
            </select>

            {reason === "Other" && (
              <textarea
                placeholder="Describe problem..."
                className="w-full border p-2 rounded mb-2"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            )}

            <button
              onClick={async () => {

                if (!reason) return alert("Select reason ❌");

                await addDoc(collection(db, "returns"), {
                  orderId: selectedOrder.id,
                  userId: selectedOrder.userId,
                  reason,
                  issue,
                  status: "Requested",
                  createdAt: new Date()
                });

                alert("Return request sent ✅");
                setShowHelp(false);

              }}
              className="w-full bg-green-600 text-white p-2 rounded"
            >
              Request Return 🔁
            </button>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-3 text-sm text-gray-500 w-full"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
