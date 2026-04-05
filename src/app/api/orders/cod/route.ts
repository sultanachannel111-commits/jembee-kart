import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      items,
      itemsTotal,
      shipping,
      total,
      address,
      sellerRef
    } = body;

    const orderId = "COD_" + Date.now();

    // 💰 PROFIT
    const totalProfit = items.reduce((sum: number, item: any) => {
      return sum + (item.price - item.basePrice) * item.qty;
    }, 0);

    const commission = sellerRef
      ? Math.floor(totalProfit * 0.5)
      : 0;

    // 🧾 SAVE ORDER
    await setDoc(doc(db, "orders", orderId), {
      orderId,
      userId,
      items,
      itemsTotal,
      shipping,
      total,
      address,
      sellerRef: sellerRef || null,
      commission,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      createdAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      orderId
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}
