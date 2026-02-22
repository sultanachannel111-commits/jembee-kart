import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { product, customer, quantity, paymentMethod } = body;

    if (!product || !customer || !quantity) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // 🔹 STEP 1: Generate Qikink Token
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

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token generation failed", tokenData },
        { status: 400 }
      );
    }

    // 🔹 STEP 2: Create Unique Order Number
    const orderNumber = "jembee_" + Date.now();

    const totalAmount = product.sellingPrice * quantity;
    const totalCost = product.costPrice * quantity;
    const profit = totalAmount - totalCost;

    // 🔹 STEP 3: Create Qikink Order
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
          order_number: orderNumber,
          qikink_shipping: "1",
          gateway: paymentMethod === "COD" ? "COD" : "Prepaid",
          total_order_value: totalAmount.toString(),
          line_items: [
            {
              search_from_my_products: 0,
              quantity: quantity.toString(),
              print_type_id: product.printTypeId,
              price: product.costPrice.toString(),
              sku: product.sku,
              designs: [
                {
                  design_code: "front",
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
            first_name: customer.firstName,
            last_name: customer.lastName,
            address1: customer.address,
            phone: customer.phone,
            email: customer.email,
            city: customer.city,
            zip: customer.pincode,
            province: customer.state,
            country_code: "IN",
          },
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (!orderData.order_id) {
      return NextResponse.json(
        { error: "Qikink order failed", orderData },
        { status: 400 }
      );
    }

    // 🔹 STEP 4: Save Order in Firestore
    await addDoc(collection(db, "orders"), {
      orderNumber,
      qikinkOrderId: orderData.order_id,
      productId: product.id,
      sellerId: product.sellerId,
      customer,
      quantity,
      totalAmount,
      profit,
      paymentMethod,
      status: "Processing",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      orderId: orderData.order_id,
    });

  } catch (error) {
    console.error("Qikink Order Error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
