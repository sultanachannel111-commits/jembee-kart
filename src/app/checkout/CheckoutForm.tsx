"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

/* 🔥 PRICE */
const getFinalPrice = (item: any) => {
  const sellPrice =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.price ??
    0;

  const discount = item.discount || 0;

  return discount > 0
    ? Math.round(sellPrice - (sellPrice * discount) / 100)
    : sellPrice;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [payment, setPayment] = useState("online");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0
  });

  const [customer, setCustomer] = useState({
    firstName: "",
    phone: "",
    address: ""
  });

  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  /* 🔥 LOAD DATA */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      // USER ADDRESS
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // CART ITEMS
      const snap = await getDocs(collection(db, "carts", u.uid, "items"));
      const arr: any[] = [];

      snap.forEach((doc) => {
        const d = doc.data();
        arr.push({
          id: doc.id,
          name: d.name,
          price: d.price,
          discount: d.discount || 0,
          variations: d.variations || [],
          quantity: d.quantity || 1,
          image: d.image || ""
        });
      });

      setItems(arr);

      // SHIPPING CONFIG
      const shipDoc = await getDoc(doc(db, "config", "shipping"));
      if (shipDoc.exists()) {
        const data: any = shipDoc.data();

        setShippingConfig({
          prepaid: data.prepaid || 0,
          cod: data.cod || 0
        });
      }
    });

    return () => unsub();
  }, []);

  /* 💰 TOTAL */
  const total = items.reduce(
    (sum, i) => sum + getFinalPrice(i) * (i.quantity || 1),
    0
  );

  const onlineDiscount = payment === "online" ? 10 : 0;

  const finalPay = Math.max(0, total - couponDiscount - onlineDiscount);

  const shippingCharge =
    payment === "cod"
      ? shippingConfig.cod || 0
      : shippingConfig.prepaid || 0;

  const grandTotal = finalPay + shippingCharge;

  /* 🎟️ COUPON */
  const applyCoupon = () => {
    if (coupon === "SAVE10") {
      setCouponDiscount(10);
    } else if (coupon === "FLAT50") {
      setCouponDiscount(50);
    } else {
      alert("Invalid coupon");
    }
  };

  /* 📦 DELIVERY DATE */
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  /* 💬 WHATSAPP */
  const sendWhatsApp = () => {
    const msg = `Order placed!\nAmount: ₹${grandTotal}`;
    window.open(
      `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`
    );
  };

  /* 💾 SAVE ADDRESS */
  const saveAddress = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { address: customer },
      { merge: true }
    );
  };

  /* 🛒 PLACE ORDER */
  const placeOrder = async () => {
    if (!user) {
      alert("Login required");
      return;
    }

    if (!customer.firstName || !customer.phone) {
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    if (payment === "cod") {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        total: grandTotal,
        paymentMethod: "cod",
        createdAt: serverTimestamp()
      });

      sendWhatsApp();
      router.push("/order-success");
    } else {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "order_" + Date.now(),
          amount: grandTotal,
          customer
        })
      });

      const data = await res.json();

      const cashfree = await load({ mode: "production" });

      if (!cashfree) {
        alert("Payment failed");
        return;
      }

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32">

      {/* TOP BAR */}
      {(couponDiscount > 0 || onlineDiscount > 0) && (
        <div className="bg-green-100 text-green-700 text-center py-2 text-sm">
          ₹{couponDiscount + onlineDiscount} OFF 🎉
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 space-y-4">

        {/* COUPON */}
        <div className="bg-white p-4 rounded-xl shadow flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon"
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={applyCoupon}
            className="bg-black text-white px-4 rounded"
          >
            Apply
          </button>
        </div>

        {/* DELIVERY */}
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          🚚 Delivery by <b>{getDeliveryDate()}</b>
        </div>

        {/* PAYMENT */}
        <div
          onClick={() => setPayment("cod")}
          className={`p-4 bg-white rounded-xl border flex justify-between ${
            payment === "cod" ? "border-pink-500" : ""
          }`}
        >
          <p>Cash on Delivery</p>
          <div className={`w-5 h-5 rounded-full border ${payment==="cod" ? "bg-pink-500":""}`} />
        </div>

        <div
          onClick={() => setPayment("online")}
          className={`p-4 bg-white rounded-xl border ${
            payment === "online" ? "border-pink-500" : ""
          }`}
        >
          <p>Pay Online</p>
          <p className="text-green-600 text-sm">₹10 OFF</p>
        </div>

        {/* ADDRESS */}
        <div className="bg-white p-4 rounded-xl shadow space-y-2">
          <input
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={customer.firstName}
            onChange={(e) =>
              setCustomer({ ...customer, firstName: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            className="w-full border p-2 rounded"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
          />
          <textarea
            placeholder="Address"
            className="w-full border p-2 rounded"
            value={customer.address}
            onChange={(e) =>
              setCustomer({ ...customer, address: e.target.value })
            }
          />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="fixed bottom-0 w-full bg-white p-4 flex justify-between items-center border-t">
        <p className="font-bold text-lg">₹{grandTotal}</p>

        <button
          onClick={placeOrder}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
