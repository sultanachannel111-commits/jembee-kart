import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

const WEBHOOK_SECRET = process.env.QIKINK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ==========================
    // 🔐 SECRET VERIFICATION
    // ==========================
    if (WEBHOOK_SECRET && data.secret !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized webhook" },
        { status: 401 }
      );
    }

    if (!data.order_number) {
      return NextResponse.json(
        { error: "Missing order number" },
        { status: 400 }
      );
    }

    const orderNumber = data.order_number;

    // ==========================
    // 🔎 CHECK IF ORDER EXISTS
    // ==========================
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
    // 💰 PROFIT CALCULATION
    // ==========================
    const costPrice = Number(data.cost_price || 0);
    const sellingPrice = Number(existingOrder?.product?.sellingPrice || 0);
    const profit = sellingPrice - costPrice;

    // ==========================
    // 🔄 UPDATE ORDER
    // ==========================
    await updateDoc(orderRef, {
      qikinkOrderId: data.order_id || null,
      qikinkTrackingId: data.tracking_id || null,
      courier: data.courier || null,
      status: data.status || "Processing",
      costPrice,
      profit,
      updatedAt: serverTimestamp(),
    });

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
