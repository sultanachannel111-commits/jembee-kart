import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔐 Get ENV variables
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing Qikink credentials in environment variables" },
        { status: 500 }
      );
    }

    // 🔑 Create Basic Auth token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // 📦 Fetch products from Qikink Sandbox
    const response = await fetch(
      "https://sandbox.qikink.com/api/products",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // 🔄 Return Qikink response
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Qikink Products Error:", error);

    return NextResponse.json(
      { error: "Server Error while fetching products" },
      { status: 500 }
    );
  }
}
