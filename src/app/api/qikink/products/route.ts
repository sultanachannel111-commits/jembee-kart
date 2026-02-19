import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(
      "https://sandbox.qikink.com/api/v1/catalog/products",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ message: "No products found" });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Import Failed" }, { status: 500 });
  }
}
