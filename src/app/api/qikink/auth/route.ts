import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing ENV variables",
      });
    }

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

    return NextResponse.json({
      success: true,
      tokenData,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
