import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, customer, quantity, paymentMethod } = body;

    const profit =
      Number(product.sellingPrice) - Number(product.costPrice);

    // STEP 1: Call Qikink API
    const qikinkRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/qikink/create-order`,
      {
        method: "POST"
      }
    );

    const qikinkData = await qikinkRes.json();

    if (!qikinkData.success) {
      return NextResponse.json({
        success: false,
        error: "Qikink order failed",
        qikinkData
      });
    }

    // STEP 2: Save order in Firestore via internal API
    const saveRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/order-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.sellerId,
          customer,
          quantity,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          profit,
          paymentMethod,
          status: "confirmed",
          qikink_order_id: qikinkData.orderData.order_id
        })
      }
    );

    await saveRes.json();

    return NextResponse.json({
      success: true,
      message: "Order placed successfully"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Checkout failed"
    });
  }
}
