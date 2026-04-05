import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { orderId, orderData } = await req.json();

    // 🔥 Cashfree verify API
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

    console.log("🔍 VERIFY RESPONSE:", data);

    // ✅ check payment success
    const paid = data?.some((p: any) => p.payment_status === "SUCCESS");

    if (!paid) {
      return NextResponse.json({
        success: false,
        message: "Payment not verified ❌"
      });
    }

    // =========================
    // 💰 SELLER PROFIT CALC
    // =========================

    const items = orderData.items || [];

    let totalProfit = 0;

    items.forEach((item: any, i: number) => {
      const profit =
        (Number(item.price) - Number(item.basePrice)) *
        Number(item.qty);

      console.log(`🧾 Item ${i + 1} Profit:`, profit);

      totalProfit += profit;
    });

    const commission = orderData.sellerRef
      ? Math.floor(totalProfit * 0.5)
      : 0;

    console.log("💰 TOTAL PROFIT:", totalProfit);
    console.log("💸 COMMISSION:", commission);

    // =========================
    // 🧾 SAVE ORDER
    // =========================

    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      totalProfit,
      commission,
      status: "Paid",
      createdAt: serverTimestamp()
    });

    // =========================
    // 💸 SAVE COMMISSION
    // =========================

    if (orderData.sellerRef && commission > 0) {
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
