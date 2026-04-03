import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📦 BODY:", body);

    const { orderId, amount, customer } = body;

    if (!orderId || !amount) {
      return NextResponse.json({
        success: false,
        message: "Missing orderId or amount",
      });
    }

    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",

      customer_details: {
        customer_id: customer?.uid || "guest_" + Date.now(),
        customer_name: customer?.firstName || "User",
        customer_email: customer?.email || "test@test.com",
        customer_phone: customer?.phone || "9999999999",
      },

      order_meta: {
        return_url:
          process.env.NEXT_PUBLIC_SITE_URL +
          `/payment-success?order_id=${orderId}`,
      },
    };

    console.log("🚀 PAYLOAD:", payload);

    const response = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2022-09-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("💳 CASHFREE RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        ...data,
      });
    }

    // ✅ FULL DATA RETURN (IMPORTANT)
    return NextResponse.json({
      success: true,
      ...data,
    });

  } catch (error) {
    console.log("❌ SERVER ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
