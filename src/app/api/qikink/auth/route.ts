import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://sandbox.qikink.com/api/authentication",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.QIKINK_CLIENT_ID,
          client_secret: process.env.QIKINK_CLIENT_SECRET,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
