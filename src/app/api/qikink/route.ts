import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function GET() {
  try {

    const res = await fetch("https://api.qikink.com/api/v1/catalog/designs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    const designs = data.data || [];

    let count = 0;

    for (const d of designs) {

      await addDoc(collection(db, "products"), {
        qikink_id: d.id,

        name: d.title || "Qikink Product",

        price: 499,

        image:
          d.design_images?.[0]?.image_url ||
          "https://via.placeholder.com/300",

        supplier: "qikink"
      });

      count++;
    }

    return NextResponse.json({
      message: "Products Imported",
      count
    });

  } catch (error) {

    return NextResponse.json({
      error: "Import failed",
      details: error
    });

  }
}
