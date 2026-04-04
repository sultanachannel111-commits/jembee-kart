import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🔥 WEBHOOK:", body);

    if (body.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = body.data.order.order_id;

      // ✅ YAHAN ORDER CONFIRM KARO (Firestore update)
      console.log("✅ PAYMENT VERIFIED:", orderId);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ success: false });
  }
}
