import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET!;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://sandbox.qikink.com/api/products", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();

    if (!data.products) {
      return NextResponse.json({ message: "No products found" });
    }

    for (let product of data.products) {
      await addDoc(collection(db, "products"), {
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        stock: product.stock || 100,
        qikinkId: product.id,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ message: "Products Imported Successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Import Failed" }, { status: 500 });
  }
}
