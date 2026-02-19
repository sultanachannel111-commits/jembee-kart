import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://sandbox.qikink.com/api/v1/products",
      {
        method: "GET",
        headers: {
          ClientId: process.env.QIKINK_CLIENT_ID as string,
          AccessToken: process.env.QIKINK_ACCESS_TOKEN as string,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
