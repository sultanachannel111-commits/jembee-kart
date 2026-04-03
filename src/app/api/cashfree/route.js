import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { orderId, amount, customer } = body;

    // ❌ validation
    if (!orderId || !amount) {
      return NextResponse.json({
        success: false,
        message: "Missing orderId or amount",
      });
    }

    // 🌐 URL
    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // 📦 payload
    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",

      customer_details: {
        customer_id: customer?.uid || "guest",
        customer_name: customer?.firstName || "User",
        customer_email: customer?.email || "test@test.com",
        customer_phone: customer?.phone || "9999999999"
      },

      order_meta: {
        return_url:
          process.env.NEXT_PUBLIC_SITE_URL +
          `/payment-success?order_id=${orderId}`
      }
    };

    // 🔥 API CALL
    const response = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log("💳 CASHFREE:", data);

    // ❌ error
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        ...data
      });
    }

    // ✅ success (IMPORTANT)
    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}
