import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function GET() {

  try {

    // STEP 1: TOKEN GENERATE
    const tokenRes = await fetch("https://api.qikink.com/api/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: "827265200202480",
        client_secret: "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7",
        grant_type: "client_credentials"
      })
    });

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;


    // STEP 2: GET DESIGNS
    const res = await fetch("https://api.qikink.com/api/v1/catalog/designs", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
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
      error: "Import Failed",
      details: String(error)
    });

  }

}
