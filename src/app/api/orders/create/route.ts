import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = "order_" + Date.now();

    const response = await fetch(
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID!,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
          "x-api-version": "2022-09-01"
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: Number(body.amount),
          order_currency: "INR",

          customer_details: {
            customer_id: body.customer?.uid || "guest",
            customer_name: body.customer?.name || "User",
            customer_email: body.customer?.email || "test@gmail.com",
            customer_phone: body.customer?.phone || "9999999999"
          },

          order_meta: {
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?order_id=${orderId}`
          }
        })
      }
    );

    const data = await response.json();

    if (!data.payment_session_id) {
      return NextResponse.json({ success: false, data });
    }

    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      order_id: orderId
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
