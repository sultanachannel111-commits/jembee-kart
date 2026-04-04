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

  // 💰 PROFIT
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

  // ✅ FIXED DEBUG LOOP
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

      if (refSeller && commission > 0) {
        await addDoc(collection(db, "commissions"), {
          sellerId: refSeller,
          orderId: ref.id,
          amount: commission,
          createdAt: serverTimestamp(),
          status: "pending"
        });
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

      <div className="fixed bottom-0 left-0 w-full p-3 bg-white shadow-lg">
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-pink-500"
        >
          {loading ? "Processing..." : `Pay ₹${total} 🚀`}
        </button>
      </div>

    </div>
  );
}
