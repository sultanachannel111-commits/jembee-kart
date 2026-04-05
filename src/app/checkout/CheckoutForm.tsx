"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";

export default function CheckoutPage() {

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [refSeller, setRefSeller] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [shippingConfig, setShippingConfig] = useState({
    prepaid: 0,
    cod: 0,
    freeShippingAbove: 0
  });

  const router = useRouter();
  const pathname = usePathname();

  // =========================
  // 🔥 LOAD DATA
  // =========================
  const loadData = async (u) => {

    // 🔥 ITEMS FIX
    const buyNow = localStorage.getItem("buy-now");
    const cart = localStorage.getItem("cart");

    if (buyNow) {
      const parsed = JSON.parse(buyNow);

      setItems([{
        ...parsed,
        qty: Number(parsed.quantity) || 1,
        price: Number(parsed.price) || 0,
        basePrice: Number(parsed.basePrice || parsed.price) || 0,
        image: parsed.image || "/no-image.png"
      }]);

    } else if (cart) {
      const parsedCart = JSON.parse(cart);
      setItems(Array.isArray(parsedCart) ? parsedCart : []);
    } else {
      setItems([]);
    }

    // 🔥 ADDRESS LOAD
    const addrSnap = await getDocs(
      collection(db, "users", u.uid, "addresses")
    );

    let all = [];
    let defaultAddr = null;

    addrSnap.forEach(d => {
      const data = { id: d.id, ...d.data() };
      all.push(data);
      if (data.isDefault) defaultAddr = data;
    });

    setAddresses(all);
    setAddress(defaultAddr || all[0] || null);

    // 🔥 SHIPPING
    const shipSnap = await getDoc(doc(db, "config", "shipping"));

    if (shipSnap.exists()) {
      const data = shipSnap.data();

      setShippingConfig({
        prepaid: Number(data.prepaid) || 0,
        cod: Number(data.cod) || 0,
        freeShippingAbove: Number(data.freeShippingAbove) || 0
      });
    }
  };

  // =========================
  // 🔥 INIT + RELOAD FIX
  // =========================
  useEffect(() => {

    const seller = localStorage.getItem("refSeller");
    setRefSeller(seller);

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return router.push("/login");

      setUser(u);
      await loadData(u);

    });

    return () => unsub();

  }, []);

  // 🔥 BACK FIX (IMPORTANT)
  useEffect(() => {
    if (auth.currentUser) {
      loadData(auth.currentUser);
    }
  }, [pathname]);

  // =========================
  // 💰 TOTAL
  // =========================
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let shipping =
    paymentMethod === "COD"
      ? shippingConfig.cod
      : shippingConfig.prepaid;

  if (
    shippingConfig.freeShippingAbove > 0 &&
    itemsTotal >= shippingConfig.freeShippingAbove
  ) {
    shipping = 0;
  }

  const total = itemsTotal + shipping;

  // =========================
  // 🚀 PAYMENT
  // =========================
  const handlePayment = async () => {

    if (!address) return alert("Add address ❌");
    if (items.length === 0) return alert("Cart empty ❌");

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        items,
        itemsTotal,
        shipping,
        total,
        address,
        sellerRef: refSeller || null
      };

      // COD
      if (paymentMethod === "COD") {

        const res = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!data.success) return alert("Order failed ❌");

        localStorage.removeItem("buy-now");
        localStorage.removeItem("cart");

        router.push(`/order-success/${data.orderId}`);
        return;
      }

      // ONLINE
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          amount: total,
          customer: {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone: address.phone
          }
        })
      });

      const data = await res.json();

      const cashfree = await load({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });

    } catch {
      alert("Payment error ❌");
    }

    setLoading(false);
  };

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="p-4 text-white">

      <h1 className="text-2xl mb-4">Checkout</h1>

      {/* ADDRESS */}
      <div className="bg-white/20 p-4 rounded mb-4">

        <div className="flex justify-between">
          <p>Address</p>
          <button onClick={()=>router.push("/account")}>
            Change
          </button>
        </div>

        {address && (
          <div>
            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}</p>
          </div>
        )}

        {/* 🔥 SELECT ADDRESS */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {addresses.map(a => (
            <div
              key={a.id}
              onClick={()=>setAddress(a)}
              className={`p-2 rounded cursor-pointer ${
                address?.id === a.id
                  ? "bg-green-500"
                  : "bg-white/20"
              }`}
            >
              {a.name}
            </div>
          ))}
        </div>

      </div>

      {/* TOTAL */}
      <div>
        Total ₹{total}
      </div>

      <button onClick={handlePayment}>
        {paymentMethod === "COD"
          ? `Place Order ₹${total}`
          : `Pay ₹${total}`}
      </button>

    </div>
  );
}
