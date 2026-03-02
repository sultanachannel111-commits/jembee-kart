import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, customer, paymentMethod } = body;

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing Qikink ENV variables" },
        { status: 500 }
      );
    }

    const orderNumber = "JB" + Date.now().toString().slice(-8);

    // 🔥 STEP 1 — SAVE ORDER FIRST
    const orderRef = await addDoc(collection(db, "orders"), {
      orderNumber,
      product,
      customer,
      paymentMethod,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    // 🔐 STEP 2 — GET TOKEN
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

    const tokenData = await tokenRes.json();

    if (!tokenData.Accesstoken) {
      return NextResponse.json({ error: "Token failed" }, { status: 400 });
    }

    const accessToken = tokenData.Accesstoken;

    // 📦 STEP 3 — CREATE QIKINK ORDER
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

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      await updateDoc(doc(db, "orders", orderRef.id), {
        status: "Failed",
      });

      return NextResponse.json({ error: "Qikink failed" }, { status: 400 });
    }

    // 🔥 STEP 4 — UPDATE FIRESTORE
    await updateDoc(doc(db, "orders", orderRef.id), {
      status: "Processing",
      qikinkOrderId: orderData.order_id || null,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Server crash", message: error.message },
      { status: 500 }
    );
  }
}
