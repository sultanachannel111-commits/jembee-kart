import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order_id = body.order_id;

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing ENV variables" },
        { status: 500 }
      );
    }

    // 🔥 STEP 1 — Generate Token
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

    // 🔥 STEP 2 — Cancel Order in Qikink
    const cancelResponse = await fetch(
      "https://sandbox.qikink.com/api/order/cancel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: clientId,
          Accesstoken: accessToken,
        },
        body: JSON.stringify({ order_id }),
      }
    );

    const cancelData = await cancelResponse.json();

    if (!cancelResponse.ok) {
      return NextResponse.json(cancelData, {
        status: cancelResponse.status,
      });
    }

    // 🔥 STEP 3 — Update Firestore Status
    await updateDoc(doc(db, "orders", order_id), {
      status: "Cancelled",
      cancelledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      cancelData,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
