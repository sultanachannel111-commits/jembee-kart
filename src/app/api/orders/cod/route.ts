import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      items = [],
      itemsTotal = 0,
      shipping = 0,
      total = 0,
      address,
      sellerRef
    } = body;

    // =========================
    // ❌ VALIDATION
    // =========================
    if (!userId) {
      return NextResponse.json({ success: false, message: "User missing" });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart empty" });
    }

    if (!address) {
      return NextResponse.json({ success: false, message: "Address missing" });
    }

    const orderId = "COD_" + Date.now();

    // =========================
    // 💰 PROFIT CALCULATION
    // =========================
    const totalProfit = items.reduce((sum: number, item: any) => {

      const sell = Number(item.price) || 0;
      const base = Number(item.basePrice) || 0;
      const qty = Number(item.qty) || 1;

      return sum + (sell - base) * qty;

    }, 0);

    // =========================
    // 💸 SELLER COMMISSION
    // =========================
    const commission = sellerRef
      ? Math.floor(totalProfit * 0.5) // 50% seller earning
      : 0;

    // =========================
    // 🧾 SAVE ORDER
    // =========================
    await setDoc(doc(db, "orders", orderId), {
      orderId,
      userId,
      items,
      itemsTotal: Number(itemsTotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      address,

      // 🔥 SELLER
      sellerRef: sellerRef || null,
      commission,

      // 🔥 PAYMENT
      paymentMethod: "COD",
      paymentStatus: "PENDING",

      // 🔥 ORDER STATUS (UI)
      orderStatus: "PLACED",

      // 🔥 EARNING STATUS (VERY IMPORTANT)
      status: "PENDING", // 👉 seller earnings ke liye

      createdAt: serverTimestamp()
    });

    // =========================
    // 🧹 CART CLEAR
    // =========================
    const snap = await getDocs(
      collection(db, "carts", userId, "items")
    );

    const deletePromises = snap.docs.map((d) =>
      deleteDoc(doc(db, "carts", userId, "items", d.id))
    );

    await Promise.all(deletePromises);

    console.log("🧹 Cart Cleared");

    // =========================
    // ✅ RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      orderId
    });

  } catch (err: any) {

    console.error("❌ ORDER ERROR:", err);

    return NextResponse.json({
      success: false,
      message: err.message || "Something went wrong"
    });

  }
}
