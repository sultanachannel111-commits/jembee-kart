import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { orderId, amount, customer } = body;

    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const response = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",

        customer_details: {
          customer_id: customer?.uid || "guest",
          customer_name: customer?.firstName || "User",
          customer_email: customer?.email,
          customer_phone: customer?.phone
        },

        order_meta: {
          return_url:
            process.env.NEXT_PUBLIC_SITE_URL +
            `/payment-success?order_id=${orderId}`
        }
      })
    });

    const data = await response.json();

    console.log("🔥 CASHFREE:", data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        ...data
      });
    }

    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}
