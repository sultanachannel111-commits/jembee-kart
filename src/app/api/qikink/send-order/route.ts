import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    /* ==========================
       GET ORDER FROM FIRESTORE
    ========================== */

    const orderRef = doc(db, "orders", orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order: any = snap.data();
    const { product, customer, paymentMethod } = order;

    /* ==========================
       GET QIKINK TOKEN
    ========================== */

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { success: false, error: "Token generation failed", tokenData },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    /* ==========================
       CREATE QIKINK ORDER
    ========================== */

    const payload = {

      order_number: orderId,

      qikink_shipping: "1",

      gateway: paymentMethod === "ONLINE" ? "Prepaid" : "COD",

      total_order_value: String(product.sellingPrice),

      line_items: [
        {
          search_from_my_products: 0,
          quantity: "1",
          print_type_id: product.printTypeId,
          price: String(product.sellingPrice),
          sku: product.sku,

          designs: [
            {
              design_code: "design1",
              placement_sku: "fr",
              design_link: product.designLink,
              mockup_link: product.mockupLink
            }
          ]
        }
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
        country_code: "IN"
      }

    };

    const orderRes = await fetch(
      "https://api.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: clientId!,
          Accesstoken: accessToken
        },
        body: JSON.stringify(payload)
      }
    );

    const orderData = await orderRes.json();

    if (!orderRes.ok) {

      await updateDoc(orderRef, {
        status: "Failed"
      });

      return NextResponse.json(
        { success: false, error: "Qikink order failed", orderData },
        { status: 400 }
      );

    }

    /* ==========================
       UPDATE FIRESTORE
    ========================== */

    await updateDoc(orderRef, {
      status: "Processing",
      qikinkOrderId: orderData.order_id || null,
      trackingId: orderData.tracking_id || null,
      courier: orderData.courier || null,
      estimatedDelivery: orderData.estimated_delivery || null
    });

    return NextResponse.json({
      success: true,
      message: "Order sent to Qikink"
    });

  } catch (error: any) {

    console.log("Qikink Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: error.message
      },
      { status: 500 }
    );

  }

}
