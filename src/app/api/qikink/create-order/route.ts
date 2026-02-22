import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing QIKINK environment variables",
      });
    }

    // 🔹 STEP 1: Generate Access Token
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

    if (!tokenData?.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Token generation failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 🔹 STEP 2: Create Unique Order Number
    const uniqueOrderNumber =
      "jembee_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 10000);

    // 🔹 STEP 3: Create Order Payload
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
              design_code: "test_design",
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

    // 🔹 STEP 4: Send Order Request
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
        error: "Order API Failed",
        orderData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order Created Successfully",
      orderData,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Server Crash",
    });
  }
}
