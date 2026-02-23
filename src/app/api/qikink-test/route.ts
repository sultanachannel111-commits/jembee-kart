import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ==============================
    // 1️⃣ Generate Access Token
    // ==============================
    const tokenResponse = await fetch(
      "https://sandbox.qikink.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ClientId: process.env.QIKINK_CLIENT_ID as string,
          client_secret: process.env.QIKINK_CLIENT_SECRET as string,
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

    // ==============================
    // 2️⃣ Create Order
    // ==============================
    const orderResponse = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: process.env.QIKINK_CLIENT_ID as string,
          Accesstoken: accessToken,
        },
        body: JSON.stringify({
          order_number: "TEST" + Date.now(),
          qikink_shipping: "1",
          gateway: "COD",
          total_order_value: "1",
          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              price: "1",
              sku: body.sku, // 👈 Frontend se bhejo
              designs: [],
            },
          ],
          shipping_address: {
            first_name: "Test",
            last_name: "User",
            address1: "Test Street",
            phone: "9999999999",
            email: "test@gmail.com",
            city: "Delhi",
            zip: "110001",
            province: "Delhi",
            country_code: "IN",
          },
        }),
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

    // ==============================
    // ✅ Success Response
    // ==============================
    return NextResponse.json({
      success: true,
      message: "Order Created Successfully",
      orderData,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
