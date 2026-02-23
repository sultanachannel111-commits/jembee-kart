import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://sandbox.qikink.com/openapi/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.QIKINK_SANDBOX_SECRET as string,
        },
        body: JSON.stringify({
          order_id: "TEST" + Date.now(),
          payment_mode: "prepaid",
          customer: {
            name: "Test User",
            email: "test@gmail.com",
            phone: "9999999999",
          },
          shipping_address: {
            address1: "Test Street",
            address2: "",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
            country: "India",
          },
          order_items: [
            {
              product_id: body.productId,
              quantity: body.quantity || 1,
              size: body.size || "M",
              color: body.color || "Black",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
