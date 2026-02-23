import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://sandbox.qikink.com/api/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QIKINK_SANDBOX_SECRET}`,
        },
        body: JSON.stringify({
          order_id: "TEST" + Date.now(),
          payment_mode: "Prepaid",
          customer: {
            name: "Test User",
            email: "test@gmail.com",
            phone: "9999999999",
          },
          shipping_address: {
            address1: "Test Street",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
            country: "India",
          },
          items: [
            {
              product_id: body.productId,
              quantity: body.quantity,
              size: body.size,
              color: body.color,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
