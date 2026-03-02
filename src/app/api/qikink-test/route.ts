import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Environment variables missing",
      });
    }

    // ============================
    // 1️⃣ GENERATE ACCESS TOKEN
    // ============================
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

    const tokenText = await tokenResponse.text();

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return NextResponse.json({
        success: false,
        step: "Token JSON Parse Failed",
        rawResponse: tokenText,
      });
    }

    if (!tokenResponse.ok || !tokenData?.Accesstoken) {
      return NextResponse.json({
        success: false,
        step: "Token Generation Failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // ============================
    // 2️⃣ CREATE UNIQUE ORDER
    // ============================
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
          print_type_id: 1, // ✅ REQUIRED
          sku: "MVnHs-Wh-S",
          designs: [
            {
              design_code: "TEST123",
              placement_sku: "fr",
              width_inches: "8",
              height_inches: "10",
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
        province: "DL",
        country_code: "IN",
      },
    };

    // ============================
    // 3️⃣ CREATE ORDER
    // ============================
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

    const orderText = await orderResponse.text();

    let orderData;
    try {
      orderData = JSON.parse(orderText);
    } catch {
      return NextResponse.json({
        success: false,
        step: "Order JSON Parse Failed",
        rawResponse: orderText,
      });
    }

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
      error: error?.message || "Server Error",
    });
  }
}
