import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { amount, customer } = body;

    const order_id = "order_" + Date.now();

    const res = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customer.uid || "guest",
          customer_name: customer.name || "Test User",
          customer_email: customer.email || "test@gmail.com",
          customer_phone: customer.phone || "9999999999"
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${order_id}`
        }
      })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({
        success: false,
        error: "❌ Not JSON from Cashfree",
        raw: text
      });
    }

    // 🔥 IMPORTANT FIX
    if (!data.payment_session_id) {
      return NextResponse.json({
        success: false,
        error: "❌ No session id from Cashfree",
        full: data
      });
    }

    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      order_id
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
