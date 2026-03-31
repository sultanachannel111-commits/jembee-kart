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
  setDoc,
  deleteDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

/* 🔥 PRICE FUNCTION */
const getFinalPrice = (item: any) => {
  const sellPrice =
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ||
    item.price ||
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

  const [review, setReview] = useState("");

  /* 🔥 LOAD USER + CART */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      // address load
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setCustomer(data.address);
      }

      // cart load
      const snap = await getDocs(collection(db, "carts", u.uid, "items"));
      const arr: any[] = [];

      snap.forEach((d) => {
        const data = d.data();
        arr.push({
          id: d.id,
          name: data.name,
          price: data.price,
          discount: data.discount || 0,
          variations: data.variations || [],
          quantity: data.quantity || 1,
          image: data.image || "",
          sellerId: data.sellerId || "admin"
        });
      });

      setItems(arr);

      // shipping config
      const shipDoc = await getDoc(doc(db, "config", "shipping"));
      if (shipDoc.exists()) {
        setShippingConfig(shipDoc.data());
      }
    });

    return () => unsub();
  }, []);

  /* 💰 CALCULATIONS */
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
    if (coupon === "SAVE10") setCouponDiscount(10);
    else if (coupon === "FLAT50") setCouponDiscount(50);
    else alert("Invalid coupon");
  };

  /* 📦 DELIVERY DATE */
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toDateString();
  };

  /* 💬 WHATSAPP FULL ORDER */
  const sendWhatsApp = () => {
    let list = "";
    items.forEach((item, i) => {
      list += `${i + 1}. ${item.name} x${item.quantity} - ₹${getFinalPrice(item)}\n`;
    });

    const msg = `🛒 ORDER

👤 ${customer.firstName}
📞 ${customer.phone}
📍 ${customer.address}

${list}

💰 Total: ₹${grandTotal}
💳 Payment: ${payment}
`;

    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`);
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

  /* 🧹 CLEAR CART */
  const clearCart = async () => {
    const snap = await getDocs(collection(db, "carts", user.uid, "items"));
    snap.forEach(async (d) => {
      await deleteDoc(d.ref);
    });
  };

  /* 💸 SELLER COMMISSION */
  const getSellerData = () => {
    return items.map((item) => {
      const total = getFinalPrice(item) * item.quantity;
      const commission = Math.round(total * 0.1);

      return {
        sellerId: item.sellerId,
        earning: total - commission,
        commission
      };
    });
  };

  /* 🛒 PLACE ORDER */
  const placeOrder = async () => {
    if (!customer.firstName || !customer.phone) {
      alert("Fill details");
      return;
    }

    await saveAddress();
    setLoading(true);

    const orderData = {
      userId: user.uid,
      items,
      total: grandTotal,
      paymentMethod: payment,
      seller: getSellerData(),
      review,
      status: "placed",
      returnStatus: "none",
      createdAt: serverTimestamp()
    };

    try {
      if (payment === "cod") {
        await addDoc(collection(db, "orders"), orderData);

        await clearCart();
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
    } catch (err) {
      console.error(err);
      alert("Order failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-32">

      {/* 🎉 DISCOUNT BAR */}
      {(couponDiscount > 0 || onlineDiscount > 0) && (
        <div className="bg-green-100 text-green-700 text-center py-2 text-sm">
          ₹{couponDiscount + onlineDiscount} OFF 🎉
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 space-y-4">

        {/* 🛒 ORDER SUMMARY */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Order Summary</h2>

          {items.map((item) => (
            <div key={item.id} className="flex gap-3 mb-3 border-b pb-2">
              <img
                src={item.image}
                className="w-14 h-14 rounded object-cover"
              />

              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="text-sm font-semibold">
                ₹{getFinalPrice(item) * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* 🎟️ COUPON */}
        <div className="bg-white p-4 rounded-xl flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon"
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={applyCoupon}
            className="bg-black text-white px-4 rounded"
          >
            Apply
          </button>
        </div>

        {/* 🚚 DELIVERY */}
        <div className="bg-white p-4 rounded-xl">
          🚚 Delivery by <b>{getDeliveryDate()}</b>
        </div>

        {/* 💳 PAYMENT */}
        <div className="bg-white p-4 rounded-xl space-y-2">
          <div
            onClick={() => setPayment("cod")}
            className={`p-2 border rounded ${payment === "cod" && "border-pink-500"}`}
          >
            Cash on Delivery (+₹{shippingConfig.cod})
          </div>

          <div
            onClick={() => setPayment("online")}
            className={`p-2 border rounded ${payment === "online" && "border-pink-500"}`}
          >
            Pay Online (₹10 OFF)
          </div>
        </div>

        {/* 🏠 ADDRESS */}
        <div className="bg-white p-4 rounded-xl space-y-2">
          <input
            placeholder="Full Name"
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

        {/* ⭐ REVIEW */}
        <div className="bg-white p-4 rounded-xl">
          <h2 className="font-semibold">Write Review</h2>
          <textarea
            placeholder="Your experience..."
            className="w-full border p-2 mt-2 rounded"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

      </div>

      {/* 🔻 BOTTOM BAR */}
      <div className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg">₹{grandTotal}</p>

          {(couponDiscount > 0 || onlineDiscount > 0) && (
            <p className="text-green-600 text-xs">
              Saved ₹{couponDiscount + onlineDiscount}
            </p>
          )}
        </div>

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
