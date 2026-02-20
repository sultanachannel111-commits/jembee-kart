import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  const clientId = process.env.QIKINK_CLIENT_ID!;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

  const tokenRes = await fetch("https://sandbox.qikink.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ClientId: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.Accesstoken;

  const statusRes = await fetch(
    `https://sandbox.qikink.com/api/order/${orderId}`,
    {
      headers: {
        ClientId: clientId,
        Accesstoken: accessToken,
      },
    }
  );

  const data = await statusRes.json();
  return NextResponse.json(data);
}
