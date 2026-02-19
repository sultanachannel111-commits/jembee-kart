import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(
      "https://sandbox.qikink.com/api/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: "TEST12345",
          shipping_address: {
            name: "Test Customer",
            address1: "Test Street 123",
            city: "Jamshedpur",
            state: "Jharkhand",
            pincode: "832110",
            country: "India",
            phone: "9999999999",
          },
          order_items: [
            {
              product_id: "63784036", 
              quantity: 1,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    return NextResponse.json(
      { error: "Order failed" },
      { status: 500 }
    );
  }
}
