"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { ShieldCheck, RefreshCcw } from "lucide-react";

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();

  useEffect(() => {
    let unsubscribeCart: any;
    let unsubscribeAddr: any;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");
      setUser(u);

      // 🛒 CART / BUY NOW
      const buyNow = localStorage.getItem("buy-now");
      if (buyNow) {
        const parsed = JSON.parse(buyNow);

        setItems([
          {
            id: "buy-now",
            productId: parsed.productId,
            name: parsed.name,
            image: parsed.image,
            price: Number(parsed.price),
            basePrice: Number(parsed.basePrice || parsed.price),
            qty: Number(parsed.quantity) || 1,
            sellerId: parsed.sellerId || "" // ✅ FIX
          }
        ]);
      } else {
        const ref = collection(db, "carts", u.uid, "items");

        unsubscribeCart = onSnapshot(ref, (snap) => {
          const data: any[] = [];

          snap.forEach((docSnap) => {
            const d = docSnap.data();

            data.push({
              id: docSnap.id,
              ...d,
              price: Number(d.price),
              basePrice: Number(d.basePrice || d.price),
              qty: Number(d.quantity || d.qty) || 1,
              sellerId: d.sellerId || "" // ✅ FIX
            });
          });

          setItems(data);
        });
      }

      // 📍 ADDRESS WITH STATE
      const addrRef = query(
        collection(db, "addresses"),
        where("userId", "==", u.uid)
      );

      unsubscribeAddr = onSnapshot(addrRef, (snap) => {
        const all: any[] = [];
        snap.forEach((d) => all.push({ id: d.id, ...d.data() }));

        setAddress(all.find((a) => a.isDefault) || all[0] || null);
      });

      const shipSnap = await getDoc(doc(db, "config", "shipping"));
      if (shipSnap.exists()) setShippingConfig(shipSnap.data() as any);
    });

    return () => {
      unsubAuth();
      if (unsubscribeCart) unsubscribeCart();
      if (unsubscribeAddr) unsubscribeAddr();
    };
  }, []);

  // 💰 COMMISSION
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalBasePrice = items.reduce((sum, i) => sum + i.basePrice * i.qty, 0);

  const profit = itemsTotal - totalBasePrice;
  const totalCommission = profit > 0 ? Math.round(profit * 0.5) : 0;

  let shippingCharge =
    paymentMethod === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shippingCharge = 0;
  }

  const grandTotal = itemsTotal + shippingCharge;

  const handlePayment = async () => {
    if (!address) return alert("Address add karo");

    if (!items[0]?.sellerId) {
      return alert("Seller missing!");
    }

    setLoading(true);

    try {
      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping: shippingCharge,
        total: grandTotal,
        basePrice: totalBasePrice,
        commission: totalCommission,

        // ✅ MAIN FIX
        sellerRef: items[0]?.sellerId,

        address,
        paymentMethod,
        orderStatus: "PLACED",
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (data.success) {
          localStorage.removeItem("buy-now");
          router.replace(`/order-success/${data.orderId}`);
        }
      } else {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: grandTotal,
            customer: {
              uid: user.uid,
              phone: address.phone
            },
            orderData
          })
        });

        const data = await res.json();
        const cashfree = await load({ mode: "production" });

        localStorage.removeItem("buy-now");

        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self"
        });
      }
    } catch (e) {
      alert("Payment Error!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <div className="bg-slate-900 p-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-2xl font-black text-white text-center uppercase">
          Secure Checkout
        </h1>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">

        {/* ADDRESS */}
        <div className="bg-white p-5 rounded-[28px] shadow-sm border">
          <div className="flex justify-between mb-3">
            <span className="text-xs font-bold">Deliver to</span>
            <button onClick={() => router.push("/profile")}>
              Change
            </button>
          </div>

          {address ? (
            <>
              <p className="font-bold">
                {address.name} | {address.phone}
              </p>

              <p className="text-xs text-gray-500">
                {address.address}, {address.city}, {address.state} -{" "}
                {address.pincode}
              </p>
            </>
          ) : (
            <button onClick={() => router.push("/profile")}>
              + Add Address
            </button>
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-5 rounded-[28px] shadow-sm">
          <p className="font-bold">Total: ₹{grandTotal}</p>
        </div>

        {/* TRUST */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <div className="bg-green-50 p-3 rounded-xl flex gap-2">
            <ShieldCheck size={14} />
            <span>Secure</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl flex gap-2">
            <RefreshCcw size={14} />
            <span>Return</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 w-full bg-white p-5 flex justify-between">
        <span className="text-xl font-bold">₹{grandTotal}</span>

        <button
          onClick={handlePayment}
          disabled={loading || items.length === 0}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
