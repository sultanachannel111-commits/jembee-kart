import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    // Cashfree data
    const orderId = body?.data?.order?.order_id;
    const amount = body?.data?.order?.order_amount;
    const paymentStatus = body?.data?.payment?.payment_status;
    const paymentId = body?.data?.payment?.cf_payment_id;
    const paymentMethod = body?.data?.payment?.payment_method;

    // Fraud protection
    if (!orderId || paymentStatus !== "SUCCESS") {
      return NextResponse.json({ success: false });
    }

    // Firestore order create
    await setDoc(doc(db, "orders", orderId), {
      orderId: orderId,
      price: amount,
      paymentId: paymentId,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      status: "Pending",
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });

  } catch (error) {

    console.log("Webhook error:", error);

    return NextResponse.json({
      success: false,
      message: "Webhook failed"
    });

  }

}
