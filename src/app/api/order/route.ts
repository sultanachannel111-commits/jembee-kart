import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productId,
      productName,
      price,
      customerEmail,
      shipping,
    } = body;

    /* ---------------- VALIDATION ---------------- */

    if (!productId || !productName || !price) {
      return NextResponse.json(
        { success: false, message: "Missing product fields" },
        { status: 400 }
      );
    }

    if (
      !shipping ||
      !shipping.first_name ||
      !shipping.address1 ||
      !shipping.city ||
      !shipping.zip ||
      !shipping.phone
    ) {
      return NextResponse.json(
        { success: false, message: "Shipping details missing" },
        { status: 400 }
      );
    }

    /* ---------------- FETCH PRODUCT FROM FIRESTORE ---------------- */

    const productSnap = await getDoc(doc(db, "products", productId));

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Product not found in Firestore" },
        { status: 404 }
      );
    }

    const productData = productSnap.data();

    /* ---------------- QIKINK TOKEN ---------------- */

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

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
        { success: false, message: "Failed to generate token" },
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
          total_order_value: productData.price.toString(),
          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              print_type_id: productData.print_type_id,
              price: productData.price.toString(),
              sku: productData.sku,
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
          shipping_address: shipping,
        }),
      }
    );

    const orderData = await orderRes.json();

    /* ---------------- SAVE ORDER TO FIRESTORE ---------------- */

    await addDoc(collection(db, "orders"), {
      productId,
      productName,
      price: productData.price,
      customerEmail: customerEmail || null,
      status: "Placed",
      qikinkOrderId: orderData.order_id || null,
      qikinkResponse: orderData,
      shipping,
      createdAt: serverTimestamp(),
    });

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
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
