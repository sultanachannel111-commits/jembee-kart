*Checkout page* 

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {

  const DEBUG = true;
  const log = (...args: any[]) => {
    if (DEBUG) console.log("🧪 DEBUG:", ...args);
  };

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [refSeller, setRefSeller] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const router = useRouter();

  // 🔥 LOAD DATA
  useEffect(() => {

    if (typeof window !== "undefined") {

      const seller = localStorage.getItem("refSeller");
      log("👤 refSeller:", seller);
      setRefSeller(seller);

      const buyNow = localStorage.getItem("buy-now");
      log("🛒 buy-now raw:", buyNow);

      if (buyNow) {
        try {
          const parsed = JSON.parse(buyNow);
          log("✅ buy-now parsed:", parsed);

          setItems([
            {
              ...parsed,
              qty: Number(parsed.quantity) || 1,
              price: Number(parsed.price) || 0,
              basePrice: Number(parsed.basePrice || parsed.price) || 0
            }
          ]);
        } catch (e) {
          log("❌ JSON parse error:", e);
        }
      } else {
        log("❌ No buy-now data found");
      }
    }

    const unsub = onAuthStateChanged(auth, async (u) => {

      log("👤 Auth user:", u);

      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const addrSnap = await getDocs(
        collection(db, "users", u.uid, "addresses")
      );

      let defaultAddr: any = null;

      addrSnap.forEach(d => {
        if (d.data().isDefault) defaultAddr = d.data();
      });

      log("📍 Address:", defaultAddr);
      setAddress(defaultAddr);

      const shipSnap = await getDoc(doc(db, "config", "shipping"));

      if (shipSnap.exists()) {
        const data = shipSnap.data();
        log("🚚 Shipping config:", data);

        setShippingConfig({
          prepaid: Number(data.prepaid) || 0,
          cod: Number(data.cod) || 0,
          freeShippingAbove: Number(data.freeShippingAbove) || 0
        });
      }

    });

    return () => unsub();

  }, []);

  // 💰 TOTAL
  const itemsTotal = items.reduce(
    (sum, i) => sum + (i.price * i.qty),
    0
  );

  let shipping =
    payment === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  // ✅ FIXED FREE SHIPPING
  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  log("💰 ItemsTotal:", itemsTotal);
  log("🚚 Shipping:", shipping);
  log("🧾 Total:", total);

  // 💰 PROFIT + COMMISSION
  const totalProfit = items.reduce((sum, item) => {
    const profit = (item.price - item.basePrice) * item.qty;
    return sum + profit;
  }, 0);

  const commission = refSeller
    ? Math.floor(totalProfit * 0.5)
    : 0;

  log("💵 Total Profit:", totalProfit);
  log("👤 Seller:", refSeller);
  log("💸 Commission:", commission);

  items.forEach((item, i) => {
    log(`Item ${i + 1}`, {
      price: item.price,
      basePrice: item.basePrice,
      qty: item.qty,
      profit: (item.price - item.basePrice) * item.qty
    });
  });

  // 🚀 PLACE ORDER
  const placeOrder = async () => {

    if (!address) {
      alert("Please add address ❌");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        paymentMethod: payment,
        address,
        sellerRef: refSeller || null,
        totalProfit,
        commission
      };

      log("🔥 ORDER DATA:", orderData);

      const ref = await addDoc(collection(db, "orders"), {
        ...orderData,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      // 💰 COMMISSION SAVE
      if (refSeller && commission > 0) {

        log("✅ Saving commission...", {
          sellerId: refSeller,
          amount: commission
        });

        await addDoc(collection(db, "commissions"), {
          sellerId: refSeller,
          orderId: ref.id,
          amount: commission,
          createdAt: serverTimestamp(),
          status: "pending"
        });

      } else {
        log("❌ Commission not saved", { refSeller, commission });
      }

      setOrderId(ref.id);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err: any) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-white p-4 pb-28">

      <h1 className="text-3xl font-bold text-center mb-6">
        Checkout 🛍
      </h1>

      {/* DEBUG UI */}
      {DEBUG && (
        <div className="bg-yellow-100 p-2 text-xs rounded mb-3 space-y-1">
          <p>ItemsTotal: {itemsTotal}</p>
          <p>Shipping: {shipping}</p>
          <p>Total: {total}</p>
          <hr />
          <p>Profit: {totalProfit}</p>
          <p>Seller: {refSeller || "No Seller"}</p>
          <p>Commission: {commission}</p>
        </div>
      )}

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="flex justify-between">
          <h2 className="font-bold">Delivery Address</h2>
          <button
            onClick={() => router.push("/profile")}
            className="text-pink-500"
          >
            Change
          </button>
        </div>

        {address ? (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-semibold">{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
            <p>{address.city} - {address.pincode}</p>
          </div>
        ) : (
          <p className="text-red-500 mt-2">
            No address found ❌
          </p>
        )}
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow mb-3">
          <img src={item.image} className="w-16 h-16 rounded-lg" />
          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
            <p className="text-green-600 font-bold">₹{item.price}</p>
          </div>
        </div>
      ))}

      {/* PAYMENT */}
      <div className="mt-6 space-y-3">
        <div
          onClick={() => setPayment("ONLINE")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "ONLINE" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          💳 Online Payment (+₹{shippingConfig.prepaid})
        </div>

        <div
          onClick={() => setPayment("COD")}
          className={`p-3 rounded-xl border cursor-pointer ${
            payment === "COD" ? "border-pink-500 bg-pink-50" : ""
          }`}
        >
          📦 Cash on Delivery (+₹{shippingConfig.cod})
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <div className="flex justify-between">
          <span>Items</span>
          <span>₹{itemsTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping}</span>
        </div>

        <hr className="my-2"/>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white shadow-lg">
        <button
          onClick={placeOrder}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>
      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center w-[90%] max-w-sm shadow-xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-green-600">
              Order Placed Successfully
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Order ID: {orderId}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
