import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { orderId, orderData } = await req.json();

    // 🔥 Cashfree verify API URL
    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;

    const response = await fetch(CASHFREE_URL, {
      method: "GET",
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01"
      }
    });

    const data = await response.json();

    // Check if data is an array (Cashfree returns array of payments)
    const paid = Array.isArray(data) && data.some((p: any) => p.payment_status === "SUCCESS");

    if (!paid) {
      return NextResponse.json({
        success: false,
        message: "Payment not verified ❌"
      });
    }

    // =========================
    // 💰 SELLER PROFIT CALC
    // =========================
    // Safety check: items array exist karna chahiye
    const items = orderData?.items || [];
    let totalProfit = 0;

    items.forEach((item: any, i: number) => {
      // Numbers ensure karne ke liye Number() wrap karna achha hai
      const salePrice = Number(item.price) || 0;
      const basePrice = Number(item.basePrice) || 0;
      const quantity = Number(item.qty) || 1;

      const profit = (salePrice - basePrice) * quantity;
      totalProfit += profit;
    });

    // Commission logic: 50% profit share for affiliate
    const commission = (orderData?.sellerRef && totalProfit > 0)
      ? Math.floor(totalProfit * 0.5)
      : 0;

    // =========================
    // 🧾 SAVE ORDER TO FIREBASE
    // =========================
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      cashfreeOrderId: orderId, // Store mapping
      totalProfit,
      commission,
      paymentStatus: "paid", // Direct confirm status
      orderStatus: "READY_FOR_MANUAL_QIKINK",
      createdAt: serverTimestamp()
    });

    // =========================
    // 💸 SAVE COMMISSION RECORD
    // =========================
    if (orderData?.sellerRef && commission > 0) {
      await addDoc(collection(db, "commissions"), {
        sellerId: orderData.sellerRef,
        orderId: orderRef.id,
        amount: commission,
        status: "pending",
        createdAt: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      totalProfit,
      commission
    });

  } catch (err: any) {
    console.log("❌ VERIFY ERROR:", err);
    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}
