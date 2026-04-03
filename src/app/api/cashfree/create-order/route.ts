import { NextResponse } from "next/server";
import { addLog } from "@/lib/debugStore";

export async function POST(req) {
  try {
    console.log("🟡 API HIT");

    const body = await req.json();

    // 🔥 DEBUG LOG
    addLog("info", body, "🟡 API me data aaya");

    console.log("🔥 BODY:", body);

    const orderId = body.orderId;
    const amount = Number(body.amount);

    const phone = body.customer?.phone || "9999999999";

    // ❌ VALIDATION
    if (!orderId || !amount) {
      const errorMsg = "Invalid orderId or amount";

      addLog("error", body, "❌ Invalid data");

      return NextResponse.json({
        success: false,
        message: errorMsg
      });
    }

    // 🌐 CASHFREE URL
    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",

      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_name: body.customer?.firstName || "User",
        customer_email: body.customer?.email || "test@test.com",
        customer_phone: phone
      },

      order_meta: {
        return_url:
          process.env.NEXT_PUBLIC_SITE_URL +
          `/payment-success?order_id=${orderId}`
      }
    };

    // 🔥 DEBUG REQUEST
    addLog("info", payload, "🟡 Cashfree ko request ja raha hai");

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

    console.log("💳 CASHFREE RESPONSE:", data);

    // 🔥 DEBUG RESPONSE
    addLog("response", data, "🟢 Cashfree response aaya");

    // ❌ ERROR CASE
    if (!response.ok) {

      addLog("error", data, "🔴 Cashfree API fail hua");

      return NextResponse.json({
        success: false,
        message: data?.message || "Cashfree error",
        full: data
      });
    }

    // ✅ SUCCESS
    addLog("success", data, "✅ Payment session create ho gaya");

    return NextResponse.json(data);

  } catch (error) {

    console.log("❌ CASHFREE ERROR:", error);

    // 🔥 DEBUG ERROR
    addLog("error", error.message, "🔴 Server crash");

    return NextResponse.json({
      success: false,
      message: error.message || "Server error"
    });
  }
}
