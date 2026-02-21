import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 🔐 Optional: Add your webhook secret here
const WEBHOOK_SECRET = process.env.QIKINK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔐 Optional Secret Verification
    if (WEBHOOK_SECRET && data.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = data.order_id;

    if (!orderId) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    // 💰 Auto Profit Calculation
    const costPrice = Number(data.cost_price || 0);
    const sellingPrice = Number(data.selling_price || 0);
    const profit = sellingPrice - costPrice;

    await setDoc(
      doc(db, "orders", orderId),
      {
        qikinkOrderId: data.order_id,
        qikinkTrackingId: data.tracking_id || null,
        customerName: data.customer_name || "",
        customerPhone: data.phone || "",
        shippingAddress: data.address || "",
        productName: data.product_name || "",
        variant: data.variant || "",
        quantity: data.quantity || 1,
        costPrice,
        sellingPrice,
        profit,
        status: data.status || "Pending",
        courier: data.courier || null,
        sellerId: data.seller_id || "admin", // later dynamic
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true } // 🔄 Important: Auto status update
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Qikink Webhook Error:", error);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
