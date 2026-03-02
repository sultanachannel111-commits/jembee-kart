import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const WEBHOOK_SECRET = process.env.QIKINK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ==========================
    // 🔐 SECRET VERIFICATION
    // ==========================
    if (WEBHOOK_SECRET) {
      if (!data.secret || data.secret !== WEBHOOK_SECRET) {
        return NextResponse.json(
          { error: "Unauthorized webhook" },
          { status: 401 }
        );
      }
    }

    // ==========================
    // 📦 VALIDATE DATA
    // ==========================
    if (!data.order_number) {
      return NextResponse.json(
        { error: "Missing order number" },
        { status: 400 }
      );
    }

    const orderNumber = data.order_number;

    const orderRef = doc(db, "orders", orderNumber);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: "Order not found in Firestore" },
        { status: 404 }
      );
    }

    const existingOrder = orderSnap.data();

    // ==========================
    // 💰 SAFE PROFIT CALCULATION
    // ==========================
    const costPrice = Number(data.cost_price || 0);
    const sellingPrice = Number(
      existingOrder?.product?.sellingPrice || 0
    );

    let profit = sellingPrice - costPrice;
    if (profit < 0) profit = 0; // safety

    // ==========================
    // 🕒 STATUS BASED TIMESTAMPS
    // ==========================
    let extraUpdates: any = {};

    if (data.status === "Shipped") {
      extraUpdates.shippedAt = serverTimestamp();
    }

    if (data.status === "Delivered") {
      extraUpdates.deliveredAt = serverTimestamp();
    }

    if (data.status === "Cancelled") {
      extraUpdates.cancelledAt = serverTimestamp();
    }

    // ==========================
    // 🔄 UPDATE FIRESTORE
    // ==========================
    await updateDoc(orderRef, {
      qikinkOrderId: data.order_id || null,
      qikinkTrackingId: data.tracking_id || null,
      courier: data.courier || null,
      status: data.status || existingOrder.status,
      costPrice,
      profit,
      updatedAt: serverTimestamp(),
      ...extraUpdates,
    });

    console.log("Webhook updated:", orderNumber);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Webhook failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
