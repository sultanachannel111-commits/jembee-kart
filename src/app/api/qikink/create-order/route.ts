import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    const response = await fetch(
      "https://sandbox.qikink.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Auth failed ❌" },
      { status: 500 }
    );
  }
}
