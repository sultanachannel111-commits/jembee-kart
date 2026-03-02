import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Qikink API working ✅ Use POST to create order.",
    mode: process.env.QIKINK_MODE || "sandbox",
  });
}

export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;
    const mode = process.env.QIKINK_MODE || "sandbox";

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
      });
    }

    const baseUrl =
      mode === "live"
        ? "https://api.qikink.com"
        : "https://sandbox.qikink.com";

    // STEP 1: TOKEN REQUEST
    const tokenRes = await fetch(`${baseUrl}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ClientId: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Token API failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // UNIQUE ORDER NUMBER (max 15 chars)
    const uniqueOrderNumber =
      "JB" + Date.now().toString().slice(-8);

    // ⚠ IMPORTANT: Replace SKU with your real Product SKU
    const orderPayload = {
      order_number: uniqueOrderNumber,
      qikink_shipping: "1",
      gateway: "COD",
      total_order_value: "475.10",
      line_items: [
        {
          search_from_my_products: 1,
          quantity: "1",
          print_type_id: 1,
          price: "475.10",
          sku: "UHd-Wh-XS", // 👈 Replace if needed
        },
      ],
      shipping_address: {
        first_name: "Ali",
        last_name: "Test",
        address1: "Test Street 123",
        phone: "9999999999",
        email: "test@example.com",
        city: "Jamshedpur",
        zip: "832110",
        province: "Jharkhand",
        country_code: "IN",
      },
    };

    // STEP 2: CREATE ORDER
    const orderRes = await fetch(
      `${baseUrl}/api/order/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: clientId,
          Accesstoken: accessToken,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    const orderData = await orderRes.json();

    return NextResponse.json({
      success: orderRes.ok,
      mode,
      orderData,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Server Crash",
      message: err?.message || "Unknown error",
    });
  }
}
