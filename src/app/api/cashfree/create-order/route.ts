import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🔥 BODY:", body);

    const orderId = body.orderId;
    const amount = Number(body.amount);

    // ✅ SAFE PHONE (important)
    const phone = body.customer?.phone || "9999999999";

    if (!orderId || !amount) {
      return NextResponse.json({
        success: false,
        message: "Invalid data"
      });
    }

    // ✅ SANDBOX URL (IMPORTANT)
    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const response = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",

        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_name: body.customer?.name || "User",
          customer_email: body.customer?.email || "test@test.com",
          customer_phone: phone
        },

        order_meta: {
          return_url:
            process.env.NEXT_PUBLIC_SITE_URL +
            `/payment-success?order_id=${orderId}`
        }
      })
    });

    const data = await response.json();

    console.log("💳 CASHFREE RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data?.message || "Cashfree error"
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.log("❌ CASHFREE ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
