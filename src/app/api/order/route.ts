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
      customerEmail,
      shipping,
    } = body;

    /* ---------------- VALIDATION ---------------- */

    if (!productId || !productName) {
      return NextResponse.json(
        { success: false, message: "Missing product details" },
        { status: 400 }
      );
    }

    if (
      !shipping ||
      !shipping.first_name ||
      !shipping.address1 ||
      !shipping.city ||
      !shipping.zip ||
      !shipping.phone ||
      !shipping.country_code
    ) {
      return NextResponse.json(
        { success: false, message: "Incomplete shipping details" },
        { status: 400 }
      );
    }

    /* ---------------- FETCH PRODUCT FROM FIRESTORE ---------------- */

    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const productData = productSnap.data();

    if (!productData.sku || !productData.print_type_id || !productData.price) {
      return NextResponse.json(
        { success: false, message: "Product configuration incomplete" },
        { status: 400 }
      );
    }

    /* ---------------- GET QIKINK TOKEN ---------------- */

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
        { success: false, message: "Token generation failed" },
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
                  design_code: productData.design_code || "default_design",
                  placement_sku: productData.placement_sku || "fr",
                  design_link: productData.design_link || "",
                  mockup_link: productData.mockup_link || "",
                },
              ],
            },
          ],
          shipping_address: shipping,
        }),
      }
    );

    const orderData = await orderRes.json();

    if (orderRes.status !== 200) {
      return NextResponse.json(
        { success: false, qikinkError: orderData },
        { status: 400 }
      );
    }

    /* ---------------- SAVE ORDER TO FIRESTORE ---------------- */

    await addDoc(collection(db, "orders"), {
      productId,
      productName,
      price: productData.price,
      customerEmail: customerEmail || null,
      shipping,
      status: "Placed",
      qikinkOrderId: orderData.order_id,
      qikinkResponse: orderData,
      createdAt: serverTimestamp(),
    });

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: orderData.order_id,
    });

  } catch (error) {
    console.error("Order API Error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
