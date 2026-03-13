import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function GET() {

  try {

    const res = await fetch("https://api.qikink.com/api/v1/products");

    const data = await res.json();

    const products = data.products || [];

    let count = 0;

    for (const p of products) {

      await addDoc(collection(db, "products"), {

        id: p.id,
        name: p.name,

        price: p.retail_price || p.price || 0,

        image:
          p.images?.[0]?.src ||
          p.image ||
          "https://via.placeholder.com/300",

        category: p.category || "tshirt",

        supplier: "qikink"
      });

      count++;

    }

    return NextResponse.json({
      message: "Products Imported",
      count
    });

  } catch (err) {

    return NextResponse.json({
      error: "Import Failed",
      details: err
    });

  }

}
