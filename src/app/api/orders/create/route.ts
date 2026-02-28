import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
const { product, paymentMethod } = body;

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing Qikink ENV variables"
      });
    }

    // TOKEN
    const tokenRes = await fetch("https://sandbox.qikink.com/api/token", {
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
        raw: tokenText
      });
    }

    const tokenData = JSON.parse(tokenText);

    if (!tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Access token missing",
        tokenData
      });
    }

    const accessToken = tokenData.Accesstoken;

    const orderNumber =
      "JB" + Date.now().toString().slice(-8);

    const orderRes = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: clientId,
          Accesstoken: accessToken,
        },
        body: JSON.stringify({
          order_number: orderNumber,
          qikink_shipping: "1",
          gateway: paymentMethod === "Prepaid" ? "Prepaid" : "COD",
          total_order_value: product.sellingPrice.toString(),
          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              print_type_id: product.printTypeId,
              price: product.sellingPrice.toString(),
              sku: product.sku,
              designs: [
                {
                  design_code: "test",
                  width_inches: "",
                  height_inches: "",
                  placement_sku: "fr",
                  design_link: product.designLink,
                  mockup_link: product.mockupLink,
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
        }),
      }
    );

    const orderText = await orderRes.text();

    if (!orderRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Order API failed",
        raw: orderText
      });
    }

    const orderData = JSON.parse(orderText);

    return NextResponse.json({
  success: true,
  orderId: orderNumber,   // ✅ Ye line add karni hai
  orderData
});

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Server Crash",
      message: err?.message || "Unknown error"
    });
  }
}
