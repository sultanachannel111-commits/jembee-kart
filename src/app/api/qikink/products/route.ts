import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET" },
        { status: 500 }
      );
    }

    const auth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    // 🔥 Possible endpoints list
    const endpoints = [
      "https://sandbox.qikink.com/api/products",
      "https://sandbox.qikink.com/api/v1/products",
      "https://sandbox.qikink.com/api/catalog/products",
    ];

    const results: any[] = [];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        });

        const text = await response.text();

        results.push({
          endpoint: url,
          status: response.status,
          response: text,
        });
      } catch (err) {
        results.push({
          endpoint: url,
          error: String(err),
        });
      }
    }

    return NextResponse.json({
      message: "Qikink endpoint test results",
      results,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Server crashed", details: String(error) },
      { status: 500 }
    );
  }
}
