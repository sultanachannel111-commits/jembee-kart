import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // STEP 1: Get Token
    const tokenResponse = await fetch(
      "https://sandbox.qikink.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ClientId: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.Accesstoken;

    // STEP 2: Create Order
    const orderResponse = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: "TEST12345",
          shipping_address: {
            name: "Ali Test",
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

    const orderData = await orderResponse.json();

    return NextResponse.json(orderData, {
      status: orderResponse.status,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Order failed ❌" },
      { status: 500 }
    );
  }
}
