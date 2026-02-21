import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    // 🔐 STEP 1 — Generate Access Token
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

    // 🚚 STEP 2 — Get Tracking Info
    const trackingResponse = await fetch(
      `https://sandbox.qikink.com/api/order/status/${order_id}`,
      {
        method: "GET",
        headers: {
          ClientId: clientId,
          Accesstoken: accessToken,
        },
      }
    );

    const trackingData = await trackingResponse.json();

    return NextResponse.json(trackingData, {
      status: trackingResponse.status,
    });

  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json(
      { error: "Tracking failed ❌" },
      { status: 500 }
    );
  }
}
