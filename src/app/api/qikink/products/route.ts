import { NextResponse } from "next/server";

export async function GET() {
  try {

    const response = await fetch(
      "https://sandbox.qikink.com/api/v1/catalog/products",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ClientId": process.env.QIKINK_CLIENT_ID!,
          "AccessToken": process.env.QIKINK_ACCESS_TOKEN!
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}
