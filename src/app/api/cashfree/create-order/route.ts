import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const orderId = body.orderId; // ✅ SAME ID

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
        order_amount: body.amount,
        order_currency: "INR",

        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_name:
            body.customer.firstName + " " + body.customer.lastName,
          customer_email: body.customer.email,
          customer_phone: body.customer.phone
        },

        order_meta: {
          return_url:
            process.env.NEXT_PUBLIC_SITE_URL +
            "/success?order_id=" + orderId
        }

      })

    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {

    return NextResponse.json({
      success: false,
      message: "Server error"
    });

  }

}
