import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const orderId = body.orderId;

    // 🔥 SAFE DATA FIX
    const amount = Number(body.amount);
    const phone = String(body.customer.phone);

    if (!amount || !phone) {
      return NextResponse.json({
        error: "Invalid data"
      });
    }

    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01"
      },

      body: JSON.stringify({

        order_id: orderId,
        order_amount: amount, // ✅ FIXED
        order_currency: "INR",

        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_name:
            (body.customer.firstName || "User") + " " +
            (body.customer.lastName || ""),
          customer_email: body.customer.email || "test@test.com",
          customer_phone: phone // ✅ FIXED
        },

        order_meta: {
          return_url:
            process.env.NEXT_PUBLIC_SITE_URL +
            "/order-success/" + orderId // ✅ FIXED
        }

      })

    });

    const data = await response.json();

    // 🔥 DEBUG
    console.log("CASHFREE RESPONSE:", data);

    return NextResponse.json(data);

  } catch (error) {

    console.log("CASHFREE ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error"
    });

  }

}
