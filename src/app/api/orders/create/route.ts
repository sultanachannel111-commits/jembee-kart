import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, customer, paymentMethod } = body;

    if (!product || !customer) {
      return NextResponse.json(
        { success: false, error: "Missing product or customer data" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: "Missing ENV variables" },
        { status: 500 }
      );
    }

    // 🔥 UNIQUE ORDER NUMBER
    const orderNumber = "JB" + Date.now().toString().slice(-8);

    // ==========================
    // 💾 SAVE ORDER IN FIRESTORE
    // ==========================
    await setDoc(doc(db, "orders", orderNumber), {
      orderNumber,
      product,
      customer,
      paymentMethod,
      status: "Pending",
      qikinkOrderId: null,
      createdAt: new Date(),
    });

    // ==========================
    // 🔐 STEP 1: GET ACCESS TOKEN (LIVE)
    // ==========================
    const tokenRes = await fetch("https://api.qikink.com/api/token", {
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

    if (!tokenData.Accesstoken) {
      return NextResponse.json(
        { success: false, error: "Token generation failed" },
        { status: 400 }
      );
    }

    const accessToken = tokenData.Accesstoken;

    // ==========================
    // 📦 STEP 2: CREATE QIKINK ORDER (LIVE)
    // ==========================
    const orderPayload = {
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
              design_code: "design1",
              placement_sku: "fr",
              design_link: product.designLink,
              mockup_link: product.mockupLink,
            },
          ],
        },
      ],
      shipping_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        zip: customer.zip,
        province: customer.state,
        country_code: "IN",
      },
    };

    const orderRes = await fetch(
      "https://api.qikink.com/api/order/create",
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

    if (!orderRes.ok) {
      await updateDoc(doc(db, "orders", orderNumber), {
        status: "Failed",
      });

      return NextResponse.json(
        { success: false, error: "Order creation failed", orderData },
        { status: 400 }
      );
    }

    // ==========================
    // 🔄 UPDATE FIRESTORE (SUCCESS)
    // ==========================
    await updateDoc(doc(db, "orders", orderNumber), {
      status: "Processing",
      qikinkOrderId: orderData.order_id || null,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      qikinkOrderId: orderData.order_id,
    });

  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server Crash",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
