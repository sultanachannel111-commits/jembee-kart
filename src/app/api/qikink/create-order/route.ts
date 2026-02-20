import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "API Working ✅",
    message: "Use POST method to create order",
  });
}

export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // 🔐 STEP 1 — Get Access Token
    const authResponse = await fetch(
      "https://sandbox.qikink.com/api/authentication",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    const authData = await authResponse.json();

    if (!authData.access_token) {
      return NextResponse.json(
        { error: "Authentication failed ❌", details: authData },
        { status: 401 }
      );
    }

    const accessToken = authData.access_token;

    // 📦 STEP 2 — Create Order using Bearer token
    const orderResponse = await fetch(
      "https://sandbox.qikink.com/api/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: "TEST12345",
          payment_type: "Prepaid",
          shipping_address: {
            first_name: "Test",
            last_name: "Customer",
            address1: "Test Street 123",
            city: "Jamshedpur",
            state: "Jharkhand",
            country: "India",
            zip: "832110",
            phone: "9999999999",
          },
          line_items: [
            {
              sku: "63784036", // 👈 Qikink SKU use karo
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
