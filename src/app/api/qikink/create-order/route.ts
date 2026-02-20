import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // STEP 1: GET TOKEN
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

    // STEP 2: CREATE ORDER
    const orderResponse = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: clientId,
          Accesstoken: accessToken,
        },
        body: JSON.stringify({
          order_number: "api_test_1",
          qikink_shipping: "1",
          gateway: "COD",
          total_order_value: "1",
          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              price: "1",
              sku: "MVnHs-Wh-S",
              designs: [
                {
                  design_code: "iPhoneXR",
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
