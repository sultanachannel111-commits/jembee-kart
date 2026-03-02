import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID missing",
      });
    }

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing ENV variables",
      });
    }

    // 🔥 STEP 1 — Generate Token
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

    if (!tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Token failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 🔥 STEP 2 — Get Order Status
    const statusRes = await fetch(
      `https://sandbox.qikink.com/api/order?id=${orderId}`,
      {
        headers: {
          ClientId: clientId,
          Accesstoken: accessToken,
        },
      }
    );

    const statusData = await statusRes.json();

    return NextResponse.json({
      success: true,
      data: statusData,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
