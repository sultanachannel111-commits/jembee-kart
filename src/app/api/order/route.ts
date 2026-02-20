import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, productName, price, customerEmail } = body;

    if (!productId || !productName || !price) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    /* ---------------- TOKEN ---------------- */

    const tokenRes = await fetch(
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

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.Accesstoken;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Token failed" },
        { status: 400 }
      );
    }

    /* ---------------- CREATE ORDER IN QIKINK ---------------- */

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
          order_number: "store_" + Date.now(),
          qikink_shipping: "1",
          gateway: "COD",
          total_order_value: price.toString(),
          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              print_type_id: 1,
              price: price.toString(),
              sku: "MVnHs-Wh-S",
              designs: [
                {
                  design_code: "iPhoneXR",
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
            address1: "Test Street",
            phone: "9999999999",
            email: customerEmail || "test@example.com",
            city: "Jamshedpur",
            zip: "832110",
            province: "Jharkhand",
            country_code: "IN",
          },
        }),
      }
    );

    const orderData = await orderRes.json();

    /* ---------------- SAVE TO FIRESTORE ---------------- */

    await addDoc(collection(db, "orders"), {
      productId,
      productName,
      price,
      customerEmail: customerEmail || null,
      status: "Placed",
      qikinkOrderId: orderData.order_id || null,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      qikinkResponse: orderData,
    });

  } catch (error) {
    console.error("Order API Error:", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
