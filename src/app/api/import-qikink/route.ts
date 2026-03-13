import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET() {

  try {

    // TOKEN
    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          client_id:process.env.QIKINK_CLIENT_ID,
          client_secret:process.env.QIKINK_CLIENT_SECRET,
          grant_type:"client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // MY PRODUCTS
    const res = await fetch(
      "https://api.qikink.com/api/v1/my-products",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    const products = data.data || [];

    let count = 0;

    for(const p of products){

      await setDoc(doc(db,"products",String(p.id)),{

        name:p.title || "Qikink Product",

        price:p.selling_price || 499,

        image:
        p.images?.[0]?.src ||
        "https://via.placeholder.com/300",

        supplier:"qikink"

      });

      count++;

    }

    return NextResponse.json({
      message:"Products Imported",
      count
    });

  } catch(e){

    return NextResponse.json({
      error:"Import Failed",
      details:String(e)
    });

  }

}
