import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const amount = body.amount;
    const customer = body.customer;

    const orderId = "order_" + Date.now();

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

        order_amount: amount,

        order_currency: "INR",

        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_name: customer.firstName + " " + customer.lastName,
          customer_email: customer.email || "test@email.com",
          customer_phone: customer.phone
        }

      })

    });

    const data = await response.json();

    if (!data.payment_link) {

      return NextResponse.json({
        success: false,
        error: data
      });

    }

    return NextResponse.json({
      success: true,
      payment_link: data.payment_link
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      success: false,
      message: "Server error"
    });

  }

}
