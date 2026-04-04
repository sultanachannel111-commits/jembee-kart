import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const response = await fetch(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID!,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
          "x-api-version": "2022-09-01"
        }
      }
    );

    const data = await response.json();

    console.log("VERIFY:", data);

    if (data.order_status === "PAID") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
