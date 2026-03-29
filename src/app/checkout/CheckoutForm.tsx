"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {

  const [items, setItems] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("online");

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  });

  /* 🔥 LOAD DATA */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      // ✅ address load
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // ✅ offers load
      const snap = await getDocs(collection(db, "offers"));
      const map: any = {};
      snap.forEach(d => {
        const data = d.data();
        map[data.productId] = data.discount;
      });
      setOffers(map);

      // ✅ cart load
      const cartSnap = await getDocs(
        collection(db, "carts", u.uid, "items")
      );

      const arr: any[] = [];
      cartSnap.forEach(d => {
        arr.push({
          id: d.id,
          ...d.data(),
          quantity: d.data().quantity || 1
        });
      });

      setItems(arr);
    });

    return () => unsub();
  }, []);

  /* 🔥 PRICE CALCULATION */
  const priceDetails = items.map(item => {
    const base =
      item?.variations?.[0]?.sizes?.[0]?.price || 0;

    const percent = offers?.[item.id] || 0;

    const discountAmount = Math.round((base * percent) / 100);

    const final = base - discountAmount;

    return {
      ...item,
      base,
      percent,
      discountAmount,
      final
    };
  });

  const totalBase = priceDetails.reduce(
    (sum, i) => sum + (i.base * i.quantity),
    0
  );

  const totalDiscount = priceDetails.reduce(
    (sum, i) => sum + (i.discountAmount * i.quantity),
    0
  );

  const total = priceDetails.reduce(
    (sum, i) => sum + (i.final * i.quantity),
    0
  );

  const shipping = items.reduce(
    (sum, i) => sum + ((i.shippingCharge || 0) * i.quantity),
    0
  );

  const codTotal = total + shipping;

  /* 🔥 SAVE ADDRESS */
  const saveAddress = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      { address: customer },
      { merge: true }
    );
  };

  /* 🔥 ONLINE PAYMENT */
  const placeOrder = async () => {
    if (!customer.firstName || !customer.phone) {
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    const res = await fetch("/api/cashfree/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "order_" + Date.now(),
        amount: total,
        customer
      })
    });

    const data = await res.json();

    const cashfree = await load({ mode: "production" });

    await cashfree.checkout({
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_self"
    });

    setLoading(false);
  };

  /* 🔥 COD */
  const placeCOD = async () => {
    if (!customer.firstName || !customer.phone) {
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      items,
      total: codTotal,
      customer,
      paymentMethod: "cod",
      status: "placed",
      createdAt: serverTimestamp()
    });

    alert("COD Order Placed ✅");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-xl mx-auto space-y-4">

        {/* 🧾 PRICE DETAILS */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-bold mb-3">Price Details</h2>

          <div className="flex justify-between text-sm">
            <span>Product Price</span>
            <span>₹{totalBase}</span>
          </div>

          <div className="flex justify-between text-green-600 text-sm">
            <span>Discount</span>
            <span>- ₹{totalDiscount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping > 0 ? `₹${shipping}` : "FREE"}</span>
          </div>

          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{paymentMode === "cod" ? codTotal : total}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="bg-green-100 text-green-700 p-2 rounded mt-2 text-sm">
              🎉 You saved ₹{totalDiscount}
            </div>
          )}
        </div>

        {/* 💳 PAYMENT */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-bold mb-3">Payment Method</h2>

          <div
            onClick={() => setPaymentMode("cod")}
            className={`p-3 border rounded mb-2 cursor-pointer ${
              paymentMode === "cod" && "border-black"
            }`}
          >
            Cash on Delivery - ₹{codTotal}
          </div>

          <div
            onClick={() => setPaymentMode("online")}
            className={`p-3 border rounded mb-2 cursor-pointer ${
              paymentMode === "online" && "border-green-600 bg-green-50"
            }`}
          >
            Pay Online - ₹{total}
          </div>

          <div
            onClick={() => setPaymentMode("upi")}
            className={`p-3 border rounded cursor-pointer ${
              paymentMode === "upi" && "border-blue-600 bg-blue-50"
            }`}
          >
            UPI Offer - ₹{total - 10}
          </div>

        </div>

        {/* 📝 ADDRESS */}
        <div className="bg-white p-4 rounded-xl shadow space-y-2">

          <input placeholder="Name"
            className="w-full p-2 border rounded"
            value={customer.firstName}
            onChange={(e)=>setCustomer({...customer,firstName:e.target.value})}
          />

          <input placeholder="Phone"
            className="w-full p-2 border rounded"
            value={customer.phone}
            onChange={(e)=>setCustomer({...customer,phone:e.target.value})}
          />

          <textarea placeholder="Address"
            className="w-full p-2 border rounded"
            value={customer.address}
            onChange={(e)=>setCustomer({...customer,address:e.target.value})}
          />

        </div>

        {/* 🚀 BUTTON */}
        <button
          onClick={
            paymentMode === "cod"
              ? placeCOD
              : placeOrder
          }
          className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg"
        >
          {loading
            ? "Processing..."
            : `Place Order ₹${
                paymentMode === "cod"
                  ? codTotal
                  : total
              }`}
        </button>

      </div>
    </div>
  );
}
