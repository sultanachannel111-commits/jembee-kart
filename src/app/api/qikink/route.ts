import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET() {

  try {

    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/x-www-form-urlencoded"
        },
        body:new URLSearchParams({
          client_id:process.env.QIKINK_CLIENT_ID || "",
          client_secret:process.env.QIKINK_CLIENT_SECRET || "",
          grant_type:"client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // MY PRODUCTS API
    const res = await fetch(
      "https://api.qikink.com/api/v1/store/products",
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
        name:p.title,
        price:p.selling_price,
        image:p.images?.[0]?.src,
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
      error:String(e)
    });

  }

}
