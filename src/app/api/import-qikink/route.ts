import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET(){

  try{

    // TOKEN
    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          client_id:process.env.QIKINK_CLIENT_ID,
          client_secret:process.env.QIKINK_CLIENT_SECRET
        })
      }
    );

    const tokenData = await tokenRes.json();

    const token = tokenData.access_token;


    // PRODUCTS
    const res = await fetch(
      "https://api.qikink.com/api/v1/products",
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
        image:p.images?.[0]?.src || "",
        supplier:"qikink"

      });

      count++;

    }

    return NextResponse.json({
      message:"Products Imported",
      count
    });

  }catch(e){

    return NextResponse.json({
      error:String(e)
    });

  }

}
