import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { order_id, orderNumber } = await req.json();

    if (!order_id || !orderNumber) {
      return NextResponse.json(
        { error: "order_id and orderNumber required" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // 🔐 STEP 1 — GET TOKEN (LIVE)
    const tokenResponse = await fetch(
      "https://api.qikink.com/api/token",
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
        { error: "Token generation failed" },
        { status: 400 }
      );
    }

    // 🚚 STEP 2 — GET ORDER DETAILS (LIVE)
    const trackingResponse = await fetch(
      `https://api.qikink.com/api/order?id=${order_id}`,
      {
        headers: {
          ClientId: clientId,
          Accesstoken: accessToken,
        },
      }
    );

    const trackingData = await trackingResponse.json();

    if (!trackingResponse.ok) {
      return NextResponse.json(trackingData, {
        status: trackingResponse.status,
      });
    }

    // 🔄 STEP 3 — UPDATE FIRESTORE
    await updateDoc(doc(db, "orders", orderNumber), {
      status: trackingData.status || "Processing",
      qikinkTrackingId: trackingData.shipping?.awb || null,
      courier: trackingData.shipping?.courier || null,
      trackingLink: trackingData.shipping?.tracking_link || null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      trackingData,
    });

  } catch (error: any) {
    console.error("Tracking Error:", error);
    return NextResponse.json(
      { error: "Tracking failed", message: error.message },
      { status: 500 }
    );
  }
}
