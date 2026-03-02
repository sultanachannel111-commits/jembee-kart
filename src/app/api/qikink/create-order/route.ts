import { NextResponse } from "next/server";

/* ================= GET METHOD (Browser Test) ================= */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Qikink API route working ✅ Use POST method to create order.",
    mode: process.env.QIKINK_MODE || "not set",
  });
}

/* ================= POST METHOD (CREATE ORDER) ================= */
export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;
    const isLive = process.env.QIKINK_MODE === "live";

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
      });
    }

    /* ================= BASE URL AUTO SWITCH ================= */
    const BASE_URL = isLive
      ? "https://api.qikink.com"
      : "https://sandbox.qikink.com";

    /* ================= STEP 1: GET TOKEN ================= */
    const tokenRes = await fetch(`${BASE_URL}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ClientId: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenText = await tokenRes.text();

    if (!tokenRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Token API failed",
        raw: tokenText,
      });
    }

    const tokenData = JSON.parse(tokenText);

    if (!tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Access token missing",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    /* ================= STEP 2: CREATE UNIQUE ORDER NUMBER ================= */
    const uniqueOrderNumber =
      "JB" + Date.now().toString().slice(-8);

    /* ================= STEP 3: ORDER PAYLOAD ================= */
    const orderPayload = {
      order_number: uniqueOrderNumber,
      qikink_shipping: "1",
      gateway: "COD",
      total_order_value: "10",
      line_items: [
        {
          search_from_my_products: 0,
          quantity: "1",
          print_type_id: 1,
          price: "10",
          sku: "MVnHs-Wh-S",
          designs: [
            {
              design_code: "test1",
              width_inches: "",
              height_inches: "",
              placement_sku: "fr",
              design_link:
                "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
              mockup_link:
                "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
            },
          ],
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

    /* ================= STEP 4: CREATE ORDER ================= */
    const orderRes = await fetch(
      `${BASE_URL}/api/order/create`,
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

    const orderText = await orderRes.text();

    if (!orderRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Order API failed",
        raw: orderText,
      });
    }

    const orderData = JSON.parse(orderText);

    return NextResponse.json({
      success: true,
      mode: isLive ? "LIVE" : "SANDBOX",
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
