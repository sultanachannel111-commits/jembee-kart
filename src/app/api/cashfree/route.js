import { NextResponse } from "next/server";
import { addLog } from "@/lib/debugStore";

export async function POST(req) {
  try {
    const body = await req.json();

    addLog("info", body, "API data aaya");

    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const payload = {
      order_id: body.orderId,
      order_amount: Number(body.amount),
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_name: "User",
        customer_email: body.customer?.email,
        customer_phone: body.customer?.phone || "9999999999"
      },
      order_meta: {
        return_url:
          process.env.NEXT_PUBLIC_SITE_URL +
          `/payment-success?order_id=${body.orderId}`
      }
    };

    const res = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    addLog("response", data, "Cashfree response");

    if (!res.ok) {
      addLog("error", data, "Cashfree fail");
      return NextResponse.json({ success: false, data });
    }

    return NextResponse.json(data);

  } catch (err) {
    addLog("error", err.message, "Server crash");

    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}
