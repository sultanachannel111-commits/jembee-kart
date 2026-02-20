import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    // ✅ Check ENV variables
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing Qikink credentials in Vercel ENV" },
        { status: 500 }
      );
    }

    // ✅ Encode credentials
    const auth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    // ✅ Correct Sandbox Endpoint
    const response = await fetch(
      "https://sandbox.qikink.com/api/catalog/products",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    // If Qikink returns error
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Qikink API Error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Qikink Fetch Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
