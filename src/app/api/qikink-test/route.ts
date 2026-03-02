import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing QIKINK environment variables",
      });
    }

    // =============================
    // 1️⃣ GENERATE ACCESS TOKEN
    // =============================
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

    if (!tokenResponse.ok || !tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        step: "Token Generation Failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // =============================
    // 2️⃣ CREATE UNIQUE ORDER NUMBER
    // =============================
    const orderNumber = "JB" + Date.now().toString().slice(-8);

    const orderPayload = {
      order_number: orderNumber,
      qikink_shipping: "1",
      gateway: "COD",
      total_order_value: "1",
      line_items: [
        {
          search_from_my_products: 0,
          quantity: "1",
          price: "1",
          sku: body?.sku || "MVnHs-Wh-S",
          designs: [
            {
              design_code: "TEST123",
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
        first_name: "MD",
        last_name: "Alim",
        address1: "Test Street",
        phone: "9999999999",
        email: "test@gmail.com",
        city: "Delhi",
        zip: "110001",
        province: "DL", // ✅ IMPORTANT FIX
        country_code: "IN",
      },
    };

    // =============================
    // 3️⃣ CREATE ORDER
    // =============================
    const orderResponse = await fetch(
      "https://sandbox.qikink.com/api/order/create",
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

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json({
        success: false,
        step: "Order Creation Failed",
        orderData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order Created Successfully",
      orderNumber,
      orderData,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Server error",
    });
  }
}
