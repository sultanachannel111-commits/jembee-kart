import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://sandbox.qikink.com/api/v1/orders",
      {
        method: "POST",
        headers: {
          ClientId: process.env.QIKINK_CLIENT_ID as string,
          AccessToken: process.env.QIKINK_ACCESS_TOKEN as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: body.order_id,
          payment_mode: "prepaid",
          shipping_address: {
            name: body.name,
            address1: body.address,
            city: body.city,
            state: body.state,
            pincode: body.pincode,
            country: "India",
            phone: body.phone,
          },
          order_items: body.items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
