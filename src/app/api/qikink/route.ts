import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET() {

  try {

    // STEP 1 TOKEN
    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: process.env.QIKINK_CLIENT_ID || "",
          client_secret: process.env.QIKINK_CLIENT_SECRET || "",
          grant_type: "client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // STEP 2 GET DESIGNS
    const res = await fetch(
      "https://api.qikink.com/api/v1/catalog/designs",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    const designs = data.data || [];

    let count = 0;

    for (const d of designs) {

      await setDoc(doc(db,"products",String(d.id)),{
        name:d.title || "Qikink Product",
        price:499,
        image:
        d.design_images?.[0]?.image_url ||
        "https://via.placeholder.com/300",
        supplier:"qikink"
      });

      count++;

    }

    return NextResponse.json({
      message:"Products Imported",
      count
    });

  } catch (e) {

    return NextResponse.json({
      error:"Import Failed",
      details:String(e)
    });

  }

}
