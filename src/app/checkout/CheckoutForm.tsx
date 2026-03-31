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

/* 🔥 PRICE FIXED (MOST IMPORTANT) */
const getFinalPrice = (item: any) => {
  const base =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.price ??
    0;

  const discount = item?.discount ?? 0;

  return Math.max(
    0,
    Math.round(base - (base * discount) / 100)
  );
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

  const codCharge = shippingConfig.cod ?? 0;
  const prepaidCharge = shippingConfig.prepaid ?? 0;

  /* 🔥 LOAD */
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

      // CART LOAD (🔥 FIXED SAFE DATA)
      const snap = await getDocs(collection(db, "carts", u.uid, "items"));
      const arr: any[] = [];

      snap.forEach((docItem) => {
        const d = docItem.data();

        arr.push({
          id: docItem.id,
          productId: d.productId || docItem.id,

          name: d.name || "Product",
          price: Number(d.price) || 0,

          discount: Number(d.discount) || 0,

          variations: Array.isArray(d.variations) ? d.variations : [],

          quantity: Number(d.quantity) || 1,

          image: d.image || ""
        });
      });

      console.log("🔥 CART ITEMS:", arr);

      setItems(arr);

      // SHIPPING
      const shipDoc = await getDoc(doc(db, "config", "shipping"));
      if (shipDoc.exists()) {
        setShippingConfig(shipDoc.data());
      }

    });

    return () => unsub();
  }, []);

  /* 💰 TOTAL (DEBUG ADDED) */
  const total = items.reduce((sum, i) => {

    console.log("ITEM:", i);
    console.log("PRICE:", i.price);
    console.log("VARIATION:", i.variations);

    return sum + getFinalPrice(i) * (i.quantity || 1);

  }, 0);

  /* 💸 ONLINE DISCOUNT */
  const onlineDiscount = payment === "online" ? 10 : 0;

  /* 🎟️ FINAL */
  const finalPay = Math.max(0, total - couponDiscount - onlineDiscount);

  /* 🚚 SHIPPING */
  const shippingCharge = payment === "cod" ? codCharge : prepaidCharge;

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

  /* 📦 DELIVERY */
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  /* 💬 WHATSAPP */
  const sendWhatsApp = () => {
    const msg = `Order placed!\nAmount: ₹${grandTotal}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`);
  };

  /* 💾 SAVE */
  const saveAddress = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { address: customer },
      { merge: true }
    );
  };

  /* 🛒 ORDER */
  const placeOrder = async () => {

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

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32">

      {(couponDiscount > 0 || onlineDiscount > 0) && (
        <div className="bg-green-100 text-green-700 text-center py-2 text-sm">
          ₹{couponDiscount + onlineDiscount} OFF 🎉
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 space-y-4">

        <h1 className="font-semibold">Checkout</h1>

        <input placeholder="Name"
          value={customer.firstName}
          onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
        />

        <input placeholder="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />

        <textarea placeholder="Address"
          value={customer.address}
          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
        />

        <button onClick={placeOrder}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl">
          {loading ? "Processing..." : `Pay ₹${grandTotal}`}
        </button>

      </div>
    </div>
  );
}
