import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = "order_" + Date.now();

    const res = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: body.amount,
        order_currency: "INR",

        customer_details: {
          customer_id: body.customer.uid,
          customer_name: body.customer.name,
          customer_email: body.customer.email,
          customer_phone: body.customer.phone
        },

        // ✅ MOST IMPORTANT FIX
        order_meta: {
          return_url: `https://jembee-kart-1v9fkcjde-md-alim-ansar-s-projects.vercel.app/success?order_id=${orderId}`
        }
      })
    });

    const data = await res.json();

    console.log("CASHFREE RESPONSE:", data);

    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (err: any) {
    console.log("ERROR:", err);

    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
