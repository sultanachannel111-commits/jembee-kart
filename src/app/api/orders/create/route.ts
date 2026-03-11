import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, customer, paymentMethod } = body;

    // ==========================
    // VALIDATION
    // ==========================
    if (!product || !customer) {
      return NextResponse.json(
        { success: false, error: "Missing product or customer data" },
        { status: 400 }
      );
    }

    // ==========================
    // UNIQUE ORDER NUMBER
    // ==========================
    const orderNumber = "JB" + Date.now().toString().slice(-8);

    // ==========================
    // SAVE ORDER IN FIRESTORE
    // ==========================
    await setDoc(doc(db, "orders", orderNumber), {
      orderNumber,
      product,
      customer,
      paymentMethod: paymentMethod || "ONLINE",
      status: "Pending",           // Admin verify karega
      qikinkOrderId: null,
      trackingId: null,
      courier: null,
      estimatedDelivery: null,
      createdAt: new Date(),
    });

    // ==========================
    // RESPONSE
    // ==========================
    return NextResponse.json({
      success: true,
      message: "Order saved. Admin will send to Qikink.",
      orderNumber,
    });

  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server Crash",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
